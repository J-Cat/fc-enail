import { Font } from 'ssd1306-i2c-js';
import { registerConfigChange } from '../config';
import { saveConfig } from '../dao/configDao';
import { scan, updateNetwork } from '../dao/networkDao';
import { showMessage } from '../hardware/display';
import { setEncoderValue } from '../hardware/rotaryEncoder';
import { playSound } from '../hardware/sound';
import { Constants } from '../models/Constants';
import { IConfig } from '../models/IConfig';
import { Icons } from '../models/icons';
import { Sounds } from '../models/sounds';
import { getQuickSet, setQuickSet } from '../utility/localDb';
import { IMenu, ISharedState, registerStateChange, setNextMode, setSharedState } from '../utility/sharedState';

let state: ISharedState;

registerStateChange('settings-mode', (oldState, newState) => {
  state = newState;
});

let Config = registerConfigChange('settings-mode', newConfig => {
  Config = newConfig;
});

export const SettingsMode = {
  key: 'settings',
  onClick: async (): Promise<void> => {
    if (!state.menu?.length) {
      return;
    }
    if (state.textinput) {
      await processTextInput();
      return;
    }
    if (state.numberinput) {
      await state.numberinput.onClick?.(state.numberinput.value);
      setSharedState({
        menu: getMenuUpdate({ action: undefined }),
        numberinput: undefined,
      });
      return;
    }
    const menu = state.menu?.[state.menu?.length - 1];
    menu.onClick(menu.current, menu.action);
  },
  onLongClick: async (): Promise<void> => {
    if (!state.menu?.length) {
      return;
    }
    if (state.textinput) {
      state.textinput.onOk?.(state.textinput.text);
      return;
    }
    if (state.numberinput) {
      state.numberinput.onClick?.(state.numberinput.value);
      return;
    }
    const menu = state.menu?.[state.menu?.length - 1];
    menu.onLongClick?.(menu.current);
  },
  onEncoderClick: async (): Promise<void> => {
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
        },
        menu: getMenuUpdate({ action: undefined }),
      });
      return;
    }
    if (state.numberinput) {
      setSharedState({
        numberinput: undefined,
        menu: getMenuUpdate({ action: undefined }),
      });
      return;
    }

    const menu = menus.pop() as IMenu;
    if (menu.isMoving) {
      setSharedState({
        menu: getMenuUpdate({ 
          isMoving: false,
          menuItems: getPresets(getQuickSet()),
        }),
      });
      return;
    }

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
  onEncoderChange: async (increment: number): Promise<void> => {
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

    if (state.numberinput) {
      setSharedState({
        numberinput: {
          ...state.numberinput,
          value: increment,
        }
      });
      return;
    }

    const menus = [...(state.menu || [])];
    const menu = menus.pop();
    if (!menu) {
      return;
    }

    if (menu?.isMoving) {
      let newPos = menu.current + increment;
      if (newPos < 0) {
        newPos = 0;
      }
      if (newPos > menu.max) {
        newPos = menu.max;
      }
      const items = [...menu.menuItems];
      const item = items[menu.current];
      let newItems = items.filter((value, index) => index !== menu.current);
      newItems = [
        ...(newPos > 0 ? newItems.slice(0, newPos) : []),
        item,
        ...(newPos < newItems.length ? newItems.slice(newPos) : [])
      ];
      setSharedState({ menu: [
        ...menus, {
          ...menu,
          current: newPos,
          menuItems: [...newItems],
        }
      ]});
      setEncoderValue(0, false);        
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

export const initSettingsMenu = (): IMenu => {
  return {
    current: 0, min: 0, max: 3,
    icon: Icons.gear,
    menuItems: ['Presets', 'General', 'Connect WiFi', 'Network Info'],
    onClick: async (index: number): Promise<void> => {
      const menus = [...(state.menu || [])];
      if (menus.length === 0) {
        return;
      }
      switch (index) {
      case 0: {
        const presets = getQuickSet();
        setSharedState({
          menu: [
            ...menus, {
              current: 0,
              min: 0,
              max: presets.length - 1,
              menuItems: getPresets(presets),
              icon: Icons.drop,
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
              }
            },
          ]});
        break;
      }
      case 1: { // General
        setSharedState({
          menu: [
            ...menus, {
              current: 0,
              min: 0,
              max: 5,
              menuItems: getGeneralMenuItems(),
              onClick: processGeneralClick,
            },
          ]});
        break;
      }
      case 2: { // connect wifi
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
              onClick: () => {
                const menus = [...(state.menu || [])];
                const menu = menus.pop() as IMenu;
                setSharedState({
                  menu: [
                    ...menus, {
                      ...menu,
                      action: 'Passcode',
                    },
                  ],
                  textinput: {
                    text: '',
                    activeChar: 'a',
                    inputMode: 'lowercase',
                    onOk: connectWifi,
                  },
                });
              },
            },
          ]});
        break;
      }
      case 3: { // network info
        const menu = menus.pop() as IMenu;
        setSharedState({ menu: [
          ...menus, {
            ...menu,
            action: menu.action === 'network' ? undefined : 'network',
          }
        ]});
        break;
      }
      }
    }
  };
};

const editPreset = async (presets: number[], index: number): Promise<void> => {
  const isNew = index === presets.length;
  setSharedState({
    menu: getMenuUpdate({ action: `Preset #${index + 1}` }),
    numberinput: {
      value: presets[index] || 400,
      min: Config.encoder.minValue,
      max: Config.encoder.maxValue,
      step: 1,
      onClick: async (value: number): Promise<void> => {
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
      },
    },
  });
  setEncoderValue(presets[index] || 400, true);
};

const connectWifi = async (passcode: string): Promise<void> => {
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
  const result = await updateNetwork('infrastructure', ssid, passcode);
  if (result.error) {
    playSound(Sounds.beep);
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

const getGeneralMenuItems = () => {
  return [
    `Min         : ${Config.encoder.minValue}`,
    `Max         : ${Config.encoder.maxValue}`,
    `Auto Shutoff: ${Config.e5cc.autoShutoff}`,
    `Screen Saver: ${Config.display.screenSaverTimeout}`,
    `Screen Off  : ${Config.display.screenOffTimeout}`,
    `LT Subdomain: ${Config.localtunnel.subdomain}`,
  ];
};

const processTextInput = async (): Promise<void> => {
  if (!state.textinput) {
    return;
  }

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
    setSharedState({
      textinput: undefined,
      menu: getMenuUpdate({ action: undefined }),
    });
    return;
  }
  case 'ok': {
    await state.textinput.onOk?.(state.textinput.text);
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
};

const processGeneralClick = (index: number) => {
  const config: IConfig = {
    autoShutoff: Config.e5cc.autoShutoff,
    max: Config.encoder.maxValue,
    min: Config.encoder.minValue,
    screenSaverTimeout: Config.display.screenSaverTimeout,
    screenOffTimeout: Config.display.screenOffTimeout,
    localtunnel: Config.localtunnel.subdomain,
  };
  switch (index) {
  case 0: {
    setSharedState({
      menu: getMenuUpdate({ action: 'Minimum' }),
      numberinput: {
        value: Config.encoder.minValue,
        min: 0,
        max: 100,
        step: 1,
        onClick: async (value: number): Promise<void> => {
          const result = await saveConfig({ ...config, min: value });
          if (result.error) {
            showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
          }
          setSharedState({
            menu: getMenuUpdate({
              menuItems: getGeneralMenuItems(),
              action: undefined,
            }),
          });
        }
      },
    });
    setEncoderValue(Config.encoder.minValue, true, 0, 100);
    break;
  }
  case 1: {
    setSharedState({
      menu: getMenuUpdate({ action: 'Maximum' }),
      numberinput: {
        value: Config.encoder.maxValue,
        min: 400,
        max: 1200,
        step: 1,
        onClick: async (value: number): Promise<void> => {
          const result = await saveConfig({ ...config, max: value });
          if (result.error) {
            showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
          }
          setSharedState({
            menu: getMenuUpdate({
              menuItems: getGeneralMenuItems(),
              action: undefined,
            }),
          });
        }
      },
    });
    setEncoderValue(Config.encoder.maxValue, true, 400, 1200);
    break;
  }
  case 2: {
    setSharedState({
      menu: getMenuUpdate({ action: 'Auto Shutoff (min)' }),
      numberinput: {
        value: Config.e5cc.autoShutoff,
        min: 30,
        max: 600,
        step: 1,
        onClick: async (value: number): Promise<void> => {
          const result = await saveConfig({ ...config, autoShutoff: value });
          if (result.error) {
            showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
          }
          setSharedState({
            menu: getMenuUpdate({
              menuItems: getGeneralMenuItems(),
              action: undefined,
            }),
          });
        }
      },
    });
    setEncoderValue(Config.e5cc.autoShutoff, true, 30, 600);
    break;
  }
  case 3: {
    setSharedState({
      menu: getMenuUpdate({ action: 'Screen Saver' }),
      numberinput: {
        value: Config.display.screenSaverTimeout,
        min: 1,
        max: 15,
        step: 1,
        onClick: async (value: number): Promise<void> => {
          const result = await saveConfig({ ...config, screenSaverTimeout: value });
          if (result.error) {
            showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
          }
          setSharedState({
            menu: getMenuUpdate({
              menuItems: getGeneralMenuItems(),
              action: undefined,
            }),
          });
        }
      },
    });
    setEncoderValue(Config.display.screenSaverTimeout, true, 1, 15);
    break;
  }
  case 4: {
    setSharedState({
      menu: getMenuUpdate({ action: 'Screen Off' }),
      numberinput: {
        value: Config.display.screenOffTimeout,
        min: Config.display.screenSaverTimeout,
        max: 60,
        step: 1,
        onClick: async (value: number): Promise<void> => {
          const result = await saveConfig({ ...config, screenOffTimeout: value });
          if (result.error) {
            showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
          }
          setSharedState({
            menu: getMenuUpdate({
              menuItems: getGeneralMenuItems(),
              action: undefined,
            }),
          });
        }
      },
    });
    setEncoderValue(Config.display.screenOffTimeout, true, Config.display.screenSaverTimeout, 60);
    break;
  }
  case 5: {
    setSharedState({
      menu: getMenuUpdate({ action: 'Localtunnel.me' }),
      textinput: {
        text: Config.localtunnel.subdomain,
        activeChar: 'a',
        inputMode: 'lowercase',
        onOk: async (text: string) => {
          const result = await saveConfig({ ...config, localtunnel: text });
          if (result.error) {
            showMessage(result.error, Font.UbuntuMono_8ptFontInfo, 5000);
          }
          setSharedState({
            menu: getMenuUpdate({
              menuItems: getGeneralMenuItems(),
              action: undefined,
            }),
          });
        }
      },
    });
  }
  }
};

const getMenuUpdate = (updates: Partial<IMenu>): IMenu[] => {
  const menus = [...(state.menu || [])];
  const menu = menus.pop() as IMenu;

  return [
    ...menus, {
      ...menu,
      ...updates,
    },
  ];
};

const getPresets = (presets: number[]): string[] => {
  return [
    ...presets.map((p, index) => `P${index+1} :  ${p}`),
  ];  
};
