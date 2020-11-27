import { registerConfigChange } from '../../config';
import { setEncoderValue } from '../../hardware/rotaryEncoder';
import { Icons } from '../../models/icons';
import { getQuickSet, setQuickSet } from '../../dao/localDb';
import { registerStateChange, setSharedState } from '../../dao/sharedState';
import { getMenuUpdate } from '../menu';
import { setNumberInput } from '../numberinput';

let state = registerStateChange('mode-settings-presets', async (oldState, newState): Promise<void> => {
  state = newState;
});

let Config = registerConfigChange('mode-settings-presets', newConfig => {
  Config = newConfig;
});

export const initPresets = async (): Promise<void> => {
  const menus = [...(state.menu || [])];

  const presets = getQuickSet();
  setSharedState({
    menu: [
      ...menus, {
        current: 0,
        min: 0,
        max: presets.length - 1,
        menuItems: getPresets(presets),
        icon: Icons.star,
        onClick: async index => {
          const presets = getQuickSet();
          const menus = [...(state.menu || [])];
          const menu = menus.pop();
          if (menu?.isMoving) {
            const newPresets = menu.menuItems.map(m => parseInt(m.replace(/^P\d+ *: *(\d+).*$/, '$1')));
            await setQuickSet(newPresets);
            setSharedState({
              menu: getMenuUpdate({
                isMoving: false,
                menuItems: getPresets(newPresets),
              }),
            });
            return;
          }
          await editPreset(presets, index);
        },
        onLongClick: async index => {
          const menus = [...(state.menu || [])];
          const presets = getQuickSet();
          setSharedState({
            menu: [
              ...menus, {
                current: 0,
                min: 0,
                max: 4,
                menuItems: ['Insert', 'Add', 'Delete', 'Move', 'Cancel'],
                onClick: async (actionIndex) => {
                  const menus = [...(state.menu || [])];
                  menus.pop();
                  const presetsMenu = menus.pop();
                  let newPresets = [...presets];
                  if (actionIndex === 0) {
                    newPresets = [
                      ...(index > 0 ? presets.slice(0, index) : []),
                      400,
                      ...(index < presets.length - 1 ? presets.slice(index) : []),
                    ];
                  } else if (actionIndex === 1) {
                    newPresets = [
                      ...(index >= 0 ? presets.slice(0, index+1) : []),
                      400,
                      ...(index < presets.length - 1 ? presets.slice(index+1) : []),
                    ];
                  } else if (actionIndex === 2) {
                    newPresets = [
                      ...(index > 0 ? presets.slice(0, index) : []),
                      ...(index < presets.length - 1 ? presets.slice(index+1) : []),
                    ];
                  } 
                  if (actionIndex !== 4) {
                    await setQuickSet(newPresets);
                  }
                  setSharedState({
                    menu: [
                      ...menus, 
                      ...(
                        presetsMenu 
                          ? [{
                            ...presetsMenu,
                            menuItems: getPresets(newPresets),
                            max: newPresets.length - 1,
                            isMoving: actionIndex === 3,
                          }] 
                          : []
                      ),
                    ],
                  });
                }
              }
            ]
          });
        },
        onMove: async () => {
          setSharedState({
            menu: getMenuUpdate({ 
              isMoving: false,
              menuItems: getPresets(getQuickSet()),
            }),
          });            
        },
      },
    ]
  });
};

export const editPreset = async (presets: number[], index: number): Promise<void> => {
  const isNew = index === presets.length;
  setNumberInput(`Preset #${index + 1}`, Config.encoder.minValue, Config.encoder.maxValue, presets[index] || 400, async (value: number): Promise<void> => {
    const newPresets = [...presets];
    if (isNew) {
      newPresets.push(value);
    } else {
      newPresets[index] = value;
    }
    await setQuickSet(newPresets);
    setSharedState({
      numberinput: undefined,
      menu: getMenuUpdate({
        menuItems: getPresets(newPresets),
        max: newPresets.length - 1,
        action: undefined,
      }),
    });
  });
  setEncoderValue(presets[index] || 400, true);
};

export const getPresets = (presets: number[]): string[] => {
  return [
    ...presets.map((p, index) => `P${index+1} :  ${p}`),
  ];  
};
