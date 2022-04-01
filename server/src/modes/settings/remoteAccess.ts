import { Font } from 'ssd1306-i2c-js';
import { registerConfigChange } from '../../config';
import { getVolume, saveConfig } from '../../dao/configDao';
import { showMessage } from '../../hardware/display';
import { IConfig } from '../../models/IConfig';
import { registerStateChange, setSharedState } from '../../dao/sharedState';
import { getMenuUpdate } from '../menu';
import { setTextInput } from '../textinput';
import { IMenu } from '../../models/IMenu';
import { getTunnelStatus, toggleTunnelActive, toggleTunnelEnabled } from '../../localtunnel';
import { setPromptInput } from '../promptinput';

let state = registerStateChange('mode-settings-remoteAccess', async (oldState, newState): Promise<void> => {
  state = newState;
});

let Config = registerConfigChange('mode-settings-remoteAccess', newConfig => {
  Config = newConfig;
});

export const initRemoteAccess = async (): Promise<void> => {
  const menus = [...(state.menu || [])];
  setSharedState({
    menu: [
      ...menus, {
        current: 0,
        min: 0,
        max: 2,
        menuItems: await getRemoteAccessMenuItems(),
        onClick: processRemoteAccessClick,
      },
    ]});
};

const getRemoteAccessMenuItems = async (): Promise<string[]> => {
  let tunnelStatus = await getTunnelStatus();

  return [
    `LT Subdomain: ${Config.localtunnel.subdomain}`,
    `${tunnelStatus?.isDisabled ? 'Enable' : 'Disable'} Remote Access`, 
    `${tunnelStatus?.isActive ? 'Stop' : 'Start'} Remote Access`, 
  ];
};

const processRemoteAccessClick = async (index: number): Promise<void> => {
  const volume = await getVolume();
  const config: IConfig = {
    autoShutoff: Config.e5cc.autoShutoff,
    max: Config.encoder.maxValue,
    min: Config.encoder.minValue,
    screenSaverTimeout: Config.display.screenSaverTimeout,
    screenOffTimeout: Config.display.screenOffTimeout,
    localtunnel: Config.localtunnel.subdomain,
    volume,
    startupSound: Config.settings.startupSound,
    buttonDebounce: Config.button.debounce,
    encoderButtonDebounce: Config.encoder.buttonDebounce,
  };

  switch (index) {
    case 0: {
      setTextInput('Localtunnel.me', Config.localtunnel.subdomain, async (text: string): Promise<void> => {
      const result = await saveConfig({ ...config, localtunnel: text });
      if (result.error) {
        showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
      }
      setSharedState({
        menu: getMenuUpdate({
          menuItems: await getRemoteAccessMenuItems(),
          action: undefined,
        }),
      });
    });
    break;
    }
    case 1: { // enable/disable remote access
      const tunnelStatus = await getTunnelStatus();
      console.log(JSON.stringify(tunnelStatus));
      await setPromptInput(
        `${tunnelStatus?.isDisabled ? 'Enable' : 'Disable' } Remote Access?`,
        async (): Promise<void> => {
          const newTunnelStatus = await toggleTunnelEnabled();
          await showMessage(
            `Remote Access ${
              newTunnelStatus?.isDisabled 
                ? (!tunnelStatus?.isDisabled ? 'Disabled' : 'Not Disabled')
                : (tunnelStatus?.isDisabled ? 'Enabled' : 'Not Enabled')
            }`
          );
          setSharedState({
            prompt: undefined,
            menu: [{
              ...(state.menu?.[0] as IMenu),
              menuItems: await getRemoteAccessMenuItems(),
            }]
          });
        }
      );        
      break;
    }
    case 2: { // start/stop remote access
      const tunnelStatus = await getTunnelStatus();
      await setPromptInput(
        `${tunnelStatus?.isActive ? 'Stop' : 'Start' } Remote Access?`,
        async (): Promise<void> => {
          const newTunnelStatus = await toggleTunnelActive();
          await showMessage(
            `Remote Access ${
              newTunnelStatus?.isActive 
                ? (!tunnelStatus?.isActive ? 'Started' : 'Failed to Start')
                : (tunnelStatus?.isActive ? 'Stopped' : 'Failed to Stop')
            }`
          );
          setSharedState({
            prompt: undefined,
            menu: [{
              ...(state.menu?.[0] as IMenu),
              menuItems: await getRemoteAccessMenuItems(),
            }]
          });
        }
      );        
      break;
    }
  }
};

