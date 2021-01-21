import { Icons } from '../models/icons';
import { IModeInstance } from '../models/IModeInstance';
import { registerStateChange, setSharedState } from '../dao/sharedState';
import { IMenu } from '../models/IMenu';
import { BaseMode } from './baseMode';
import { initGeneral } from './settings/general';
import { initNetworkInfo } from './settings/networkInfo';
import { initPresets } from './settings/presets';
import { initWifi } from './settings/wifi';
import { setPromptInput } from './promptinput';
import { updateNetwork } from '../dao/networkDao';
import { showMessage } from '../hardware/display';
import { checkForUpdates } from '../dao/systemDao';
import { isSupportShellEnabled, toggleSupportShell } from '../remoteSupport';
import { Font } from 'ssd1306-i2c-js';

let state = registerStateChange('mode-settings', async (oldState, newState): Promise<void> => {
  state = newState;
});

export const SettingsMode: IModeInstance = {
  ...BaseMode,
  key: 'settings',
} as IModeInstance;

export const initSettingsMenu = (): IMenu => {
  return {
    current: 0, min: 0, max: 6,
    icon: Icons.gear,
    menuItems: ['Presets', 'General', 'Connect WiFi', 'Enable Hotspot', 'Network Info', 'Check for Updates', 'Support Shell'],
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
            } else {
              await showMessage('Started AP, FCEnail, password: 1234567890');
            }
            setSharedState({
              prompt: undefined,
            });
          },
        );        
        break;
      }
      case 4: { // network info
        await initNetworkInfo();
        break;
      }
      case 5: { // check for updates
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const version = require('../../package.json').version;
        await setPromptInput(
          `Check for updates (version: ${version})?`,
          async (): Promise<void> => {
            const { error } = await checkForUpdates();
            if (error) {
              await showMessage(error);
            } else {
              await showMessage('Update requested.');
            }
            setSharedState({
              prompt: undefined,
            });
          },
        );        
        break;
      }
      case 6: { // enable support
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        
        await setPromptInput(
          `${isSupportShellEnabled() ? 'Disable' : 'Enable' } Remote Support Shell?`,
          async (): Promise<void> => {
            const supportUrl = await toggleSupportShell();
            if (supportUrl) {
              await showMessage(supportUrl, Font.UbuntuMono_10ptFontInfo, 30000);
            } else {
              await showMessage('Disabled support');
            }
            setSharedState({
              prompt: undefined,
            });
          },
        );        
        break;
      }
      }
    }
  };
};
