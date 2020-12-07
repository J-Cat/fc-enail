import { Font } from 'ssd1306-i2c-js';
import { scan, updateNetwork } from '../../dao/networkDao';
import { showMessage } from '../../hardware/display';
import { playSound } from '../../hardware/sound';
import { Icons } from '../../models/icons';
import { getSounds } from '../../models/sounds';
import { setSharedState, registerStateChange } from '../../dao/sharedState';
import { setTextInput } from '../textinput';

let state = registerStateChange('mode-settings-wifi', async (oldState, newState): Promise<void> => {
  state = newState;
});

export const initWifi = async (): Promise<void> => {
  const menus = [...(state.menu || [])];
  setSharedState({ loading: true, loadingMessage: 'Scanning ...', });
  const ssids = await scan();
  setSharedState({
    loading: false,
    loadingMessage: '',
    menu: [
      ...menus, {
        icon: Icons.wifi,
        current: 0,
        min: 0,
        max: (ssids?.ssids?.length || 1) - 1,
        menuItems: ssids.ssids || [],
        onClick: (): Promise<void> => {
          setTextInput('Passcode', '', connectWifi);
          return Promise.resolve();
        },
      },
    ]
  });
};

const connectWifi = async (passcode: string): Promise<void> => {
  const menus = [...(state.menu || [])];
  const menu = menus.pop();
  const ssid = menu?.menuItems[menu.current];
  if (!ssid) {
    playSound((await getSounds()).beep);
    setSharedState({
      textinput: undefined,
    });
    return;
  }

  setSharedState({
    loading: true,
    loadingMessage: 'Connecting ...',
  });
  const result = await updateNetwork('infrastructure', ssid, passcode);
  if (result.error) {
    playSound((await getSounds()).beep);
    console.error(result.error);
    showMessage(result.error, Font.UbuntuMono_8ptFontInfo);
    setSharedState({
      textinput: undefined,
      loading: false,
    });
    return;
  }
  showMessage(`Connected to ${ssid}`, Font.UbuntuMono_10ptFontInfo);
  setSharedState({
    textinput: undefined,
    loading: false,
    menu: [
      ...menus,
    ]
  });
};
