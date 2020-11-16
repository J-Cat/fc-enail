import { scan, updateNetwork } from '../dao/networkDao';
import { updateE5ccSetPoint } from '../hardware/e5cc';
import { setEncoderValue } from '../hardware/rotaryEncoder';
import { playSound } from '../hardware/sound';
import { Constants } from '../models/Constants';
import { Sounds } from '../models/sounds';
import { IMenu, ISharedState, registerStateChange, setNextMode, setSharedState } from '../utility/sharedState';

let lastState: ISharedState | undefined;
let state: ISharedState;

registerStateChange('settings-mode', (oldState, newState) => {
  lastState = oldState;
  state = newState;
});

export const SettingsMode = {
  key: 'settings',
  onClick: async () => {
    if (!state.menu?.length) {
      return;
    }
    if (state.textinput) {
      switch (state.textinput.activeChar) {
        case 'mode': {
          setSharedState({
            textinput: {
              ...state.textinput,
              inputMode: state.textinput.inputMode === 'lowercase' ? 'uppercase' : state.textinput.inputMode === 'uppercase' ? 'symbols' : 'lowercase',
            },
          });    
          return;
        }
        case 'del': {
          setSharedState({
            textinput: {
              ...state.textinput,
              text: state.textinput.text.substr(0, state.textinput.text.length-1),
            },
          });
          return;    
        }
        case 'cancel': {
          const menus = [...(state.menu || [])];
          const menu = menus.pop() as IMenu;
          setSharedState({
            textinput: undefined,
            menu: [
              ...menus, {
                ...menu,
                action: undefined,
              },
            ],
          });
          return;
        }
        case 'ok': {
          const menus = [...(state.menu || [])];
          const menu = menus.pop();
          const ssid = menu?.menuItems[menu.current];
          if (!ssid) {
            playSound(Sounds.beep);
            setSharedState({
              textinput: undefined,
            });
            return;
          }

          setSharedState({
            loading: true,
            loadingMessage: 'Connecting ...',
          });
          const result = await updateNetwork('infrastructure', ssid, state.textinput.text);
          if (result.error) {
            playSound(Sounds.beep);
            console.error(result.error);
            setSharedState({
              textinput: undefined,
              loading: false,
            });
            return;
          }
          setSharedState({
            textinput: undefined,
            loading: false,
            menu: [
              ...menus, 
            ]
          });          
          return;
        }
      }
      setSharedState({
        textinput: {
          ...state.textinput,
          text: state.textinput.text + state.textinput.activeChar,
        },
      });
      return;
    }
    const menu = state.menu?.[state.menu?.length - 1];
    menu.onClick(menu.current, menu.action);
  },
  onEncoderClick: async () => {
    const menus = [...(state.menu || [])];
    if (menus.length <= 1) {
      if (menus?.[0].action) {
        setSharedState({ menu: [{...menus[0], action: undefined }]});
        return;
      }

      setNextMode('self');
      return;
    }
    if (state.textinput) {
      setSharedState({ 
        textinput: {
          ...state.textinput,
          inputMode: state.textinput?.inputMode === 'lowercase' 
            ? 'uppercase' 
            : state.textinput?.inputMode === 'uppercase' 
            ? 'symbols' 
            : 'lowercase',
        }
      });
      return;
    }

    let menu = menus.pop() as IMenu;
    if (menu?.action) {
      setSharedState({ menu: [...menus, { ...menu, action: undefined }]});
      return;
    }
    if (menu) {
      setSharedState({ menu: [...menus]});
      return;
    }
    setSharedState({ mode: 'profiles' }, 'self');
  },
  onEncoderChange: async (increment: number) => {
    const line = Constants.textInput[state.textinput?.inputMode || 'lowercase'];
    const max = line.length + 4;
    if (state.textinput) {
      const charIndex = state.textinput.activeChar === 'mode'
        ? max - 3
        : state.textinput.activeChar === 'del'
        ? max - 2
        : state.textinput.activeChar === 'cancel'
        ? max - 1
        : state.textinput.activeChar === 'ok'
        ? max
        : line.indexOf(state.textinput?.activeChar);
      let newIndex = charIndex + increment;
      if (newIndex < 0) {
        newIndex = max + newIndex;
      }
      let newChar = state.textinput.activeChar;
      if (newIndex === max - 3) {
        newChar = 'mode';
      } else if (newIndex === max - 2) {
        newChar = 'del';
      } else if (newIndex === max - 1) {
        newChar = 'cancel';
      } else if (newIndex === max) {
        newChar = 'ok';
      } else {
        newChar = line.charAt(newIndex);
      }
      setSharedState({
        textinput: {
          ...state.textinput,
          activeChar: newChar,
        },
      });
      setEncoderValue(0, false);
      return;
    }
    const menus = [...(state.menu || [])];
    const menu = menus.pop();
    if (!menu) {
      return;
    }
    let newPos = (menu.current || 0) + increment;
    if (newPos >= (menu.max || 0)) {
      newPos = menu.max || 0;
    } else if (newPos < (menu.min || 0)) {
      newPos = menu.min || 0;
    }
    setSharedState({ menu: [
      ...menus, {
        ...menu,
        current: newPos,
      }
    ]});
    setEncoderValue(0, false);
  },
};

export const initSettingsMenu = () => {
  return { 
    current: 0, min: 0, max: 2, 
    menuItems: ['Network Info', 'Connect WiFi', 'General'],
    onClick: async (index: number, action?: string): Promise<void> => {
      const menus = [...(state.menu || [])];
      if (menus.length === 0) {
        return;
      }
      switch (index) {
        case 0: { // network info
          const menu = menus.pop() as IMenu;
          setSharedState({ menu: [
            ...menus, {
              ...menu,
              action: menu.action === 'network' ? undefined : 'network',
            }
          ]});
          break;
        }
        case 1: { // connect wifi
          setSharedState({ loading: true, loadingMessage: 'Scanning ...', });
          const ssids = await scan();
          setSharedState({ 
            loading: false,
            loadingMessage: '',
            menu: [
            ...menus, {
              current: 0,
              min: 0,
              max: (ssids?.ssids?.length || 1) - 1,
              menuItems: ssids.ssids || [],
              onClick: index => {
                const menus = [...(state.menu || [])];
                const menu = menus[menus?.length - 1];
                setSharedState({
                  menu: [
                    ...menus, {
                      ...menu,
                      action: 'connect',
                    },
                  ],
                  textinput: {
                    text: '',
                    activeChar: 'a',
                    inputMode: 'lowercase',
                  },
                });
              },
            },
          ]});
          break;
        }
        case 2: { // General
          break;
        }
      }
    } 
  };
};