import { Icons } from '../models/icons';
import { IModeInstance } from '../models/IModeInstance';
import { registerStateChange } from '../dao/sharedState';
import { IMenu } from '../models/IMenu';
import { BaseMode } from './baseMode';
import { initGeneral } from './settings/general';
import { initNetworkInfo } from './settings/networkInfo';
import { initPresets } from './settings/presets';
import { initWifi } from './settings/wifi';
import { setPromptInput } from './promptinput';
import { updateNetwork } from '../dao/networkDao';
import { showMessage } from '../hardware/display';

let state = registerStateChange('mode-settings', async (oldState, newState): Promise<void> => {
  state = newState;
});

export const SettingsMode: IModeInstance = {
  ...BaseMode,
  key: 'settings',
} as IModeInstance;

export const initSettingsMenu = (): IMenu => {
  return {
    current: 0, min: 0, max: 3,
    icon: Icons.gear,
    menuItems: ['Presets', 'General', 'Connect WiFi', 'Enable Hotspot', 'Network Info'],
    onClick: async (index: number): Promise<void> => {
      const menus = [...(state.menu || [])];
      if (menus.length === 0) {
        return;
      }
      switch (index) {
      case 0: {
        await initPresets();
        break;
      }
      case 1: { // General
        await initGeneral();
        break;
      }
      case 2: { // connect wifi
        await initWifi();
        break;
      }
      case 3: { // hotspot
        await setPromptInput(
          'Enable FC-Enail Hotspot?',
          async (): Promise<void> => {
            const { error } = await updateNetwork('ap', 'FCEnail', '1234567890');
            if (error) {
              await showMessage(error);
              return;
            }
          },
        );        
        break;
      }
      case 4: { // network info
        await initNetworkInfo();
        break;
      }
      }
    }
  };
};
