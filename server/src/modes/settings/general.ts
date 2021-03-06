import { Font } from 'ssd1306-i2c-js';
import { registerConfigChange } from '../../config';
import { getVolume, saveConfig } from '../../dao/configDao';
import { showMessage } from '../../hardware/display';
import { IConfig } from '../../models/IConfig';
import { registerStateChange, setSharedState } from '../../dao/sharedState';
import { getMenuUpdate } from '../menu';
import { setNumberInput } from '../numberinput';
import { setTextInput } from '../textinput';
import { getSounds } from '../../dao/soundsDao';
import { IMenu } from '../../models/IMenu';
import { getTimezone, getTimezones, setTimezone } from '../../dao/systemDao';

let state = registerStateChange('mode-settings-general', async (oldState, newState): Promise<void> => {
  state = newState;
});

let Config = registerConfigChange('mode-settings-general', newConfig => {
  Config = newConfig;
});

export const initGeneral = async (): Promise<void> => {
  const menus = [...(state.menu || [])];
  setSharedState({
    menu: [
      ...menus, {
        current: 0,
        min: 0,
        max: 8,
        menuItems: await getGeneralMenuItems(),
        onClick: processGeneralClick,
      },
    ]});
};

const getGeneralMenuItems = async (): Promise<string[]> => {
  const volume = await getVolume();
  const timezone = await getTimezone();
  return [
    `Volume      : ${volume}`,
    `Min         : ${Config.encoder.minValue}`,
    `Max         : ${Config.encoder.maxValue}`,
    `Auto Shutoff: ${Config.e5cc.autoShutoff}`,
    `Screen Saver: ${Config.display.screenSaverTimeout}`,
    `Screen Off  : ${Config.display.screenOffTimeout}`,
    `LT Subdomain: ${Config.localtunnel.subdomain}`,
    `Start Sound : ${Config.settings.startupSound}`,
    `Time Zone   : ${timezone}`,
  ];
};

export const initTimezones = async (): Promise<void> => {
  const timezones = await getTimezones();
  setSharedState({
    menu: [
      ...(state.menu || []),
      {
        current: 0,
        min: 0,
        max: timezones.length - 1,
        menuItems: timezones,
        onClick: async index => {
          await setTimezone(timezones[index]);
          await showMessage(`Timezone set to ${timezones[index]}`);
          const menus = [...(state.menu || [])];
          menus.pop();
          const menu = menus.pop() as IMenu;
          setSharedState({
            menu: [
              ...menus, {
                ...menu, 
                menuItems: await getGeneralMenuItems(),
              },
            ],
          });      
        },
      }
    ],
  });
};

const processGeneralClick = async (index: number): Promise<void> => {
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
  };
  switch (index) {
  case 0: {
    setNumberInput('Volume', 0, 100, volume, async (value: number): Promise<void> => {
      const result = await saveConfig({ ...config, volume: value });
      if (result.error) {
        showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
      }
      setSharedState({
        menu: getMenuUpdate({
          menuItems: await getGeneralMenuItems(),
          action: undefined,
        }),
      });
    });
    break;
  }
  case 1: {
    setNumberInput('Minimum', 0, 100, Config.encoder.minValue, async (value: number): Promise<void> => {
      const result = await saveConfig({ ...config, min: value });
      if (result.error) {
        showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
      }
      setSharedState({
        menu: getMenuUpdate({
          menuItems: await getGeneralMenuItems(),
          action: undefined,
        }),
      });
    });
    break;
  }
  case 2: {
    setNumberInput('Maximum', 400, 1200, Config.encoder.maxValue, async (value: number): Promise<void> => {
      const result = await saveConfig({ ...config, max: value });
      if (result.error) {
        showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
      }
      setSharedState({
        menu: getMenuUpdate({
          menuItems: await getGeneralMenuItems(),
          action: undefined,
        }),
      });
    });
    break;
  }
  case 3: {
    setNumberInput('Auto Shutoff (min)', 30, 600, Config.e5cc.autoShutoff, async (value: number): Promise<void> => {
      const result = await saveConfig({ ...config, autoShutoff: value });
      if (result.error) {
        showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
      }
      setSharedState({
        menu: getMenuUpdate({
          menuItems: await getGeneralMenuItems(),
          action: undefined,
        }),
      });
    });
    break;
  }
  case 4: {
    setNumberInput('Screen Saver', 1, 15, Config.display.screenSaverTimeout, async (value: number): Promise<void> => {
      const result = await saveConfig({ ...config, screenSaverTimeout: value });
      if (result.error) {
        showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
      }
      setSharedState({
        menu: getMenuUpdate({
          menuItems: await getGeneralMenuItems(),
          action: undefined,
        }),
      });
    });
    break;
  }
  case 5: {
    setNumberInput('Screen Off', Config.display.screenSaverTimeout, 60, Config.display.screenOffTimeout, async (value: number): Promise<void> => {
      const result = await saveConfig({ ...config, screenOffTimeout: value });
      if (result.error) {
        showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
      }
      setSharedState({
        menu: getMenuUpdate({
          menuItems: await getGeneralMenuItems(),
          action: undefined,
        }),
      });
    });
    break;
  }
  case 6: {
    setTextInput('Localtunnel.me', Config.localtunnel.subdomain, async (text: string): Promise<void> => {
      const result = await saveConfig({ ...config, localtunnel: text });
      if (result.error) {
        showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
      }
      setSharedState({
        menu: getMenuUpdate({
          menuItems: await getGeneralMenuItems(),
          action: undefined,
        }),
      });
    });
    break;
  }
  case 7: {
    const sounds = Object.keys((await getSounds()));
    if (sounds.length <= 0) {
      break;
    }
    setSharedState({
      menu: [
        ...(state.menu || []),
        {
          current: 0,
          min: 0,
          max: sounds.length - 1,
          menuItems: sounds,
          onClick: async index => {
            const result = await saveConfig({...config, startupSound: sounds[index]});
            if (result.error) {
              showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
            }
            const menus = [...(state.menu || [])];
            menus.pop();
            const menu = menus.pop() as IMenu;
            setSharedState({
              menu: [
                ...menus, {
                  ...menu, 
                  menuItems: await getGeneralMenuItems(),
                },
              ],
            });      
          },
        }
      ],
    });
    break;
  }
  case 8: {
    await initTimezones();
    break;
  }
  }
};
