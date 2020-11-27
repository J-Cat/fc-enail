import { Guid } from 'guid-typescript';
import { Font } from 'ssd1306-i2c-js';
import { deleteProfile, saveProfile, setCurrentProfile, toggleTuning } from '../dao/profilesDao';
import { showMessage } from '../hardware/display';
import { setEncoderValue } from '../hardware/rotaryEncoder';
import { Icons } from '../models/icons';
import { IModeInstance } from '../models/IModeInstance';
import { getProfiles } from '../dao/localDb';
import { registerStateChange, setSharedState } from '../dao/sharedState';
import { IMenu } from '../models/IMenu';
import { BaseMode } from './baseMode';
import { setNumberInput } from './numberinput';
import { setPromptInput } from './promptinput';
import { setTextInput } from './textinput';
import { IProfile } from '../models/IProfile';

let profiles: IProfile[] = [];

let state = registerStateChange('mode-profiles', async (oldState, newState): Promise<void> => {
  state = newState;
  if ((oldState?.mode !== newState.mode) && (newState.mode === 'profiles')) {
    profiles = getProfiles();
    setEncoderValue(0);
  }
});

export const ProfilesMode: IModeInstance = {
  ...BaseMode,
  key: 'profiles',
} as IModeInstance;

export const initProfilesMenu = (): IMenu => {
  profiles = getProfiles();
  return {
    current: state.currentProfile || 0,
    min: 0, max: profiles.length - 1,
    icon: Icons.drop,
    menuItems: profiles.map(p => p.title),
    onClick: async (index: number): Promise<void> => {
      const profile = {...profiles[index || 0]};
      if (!profile) {
        return;
      }
      await setPromptInput(
        `Load ${profile?.title} (P:${profile?.p},I:${profile?.i},D:${profile?.d})?`,
        async (): Promise<void> => {
          const { error } = await setCurrentProfile(profile.key);
          if (error) {
            await showMessage(error);
            return;
          }
          await refreshProfileMenu(index);
        },
      );        
    }, 
    onLongClick: async (index): Promise<void> => {
      const menus = [...(state.menu || [])];
      setSharedState({
        menu: [
          ...menus, {
            current: 0,
            min: 0,
            max: 4,
            menuItems: ['Edit', 'Auto-Tune', 'Add', 'Delete', 'Cancel'],
            onClick: async (subIndex): Promise<void> => {
              switch (subIndex) {
              case 0: {
                const profile = profiles[index];
                await editProfile(profile);
                break;
              }
              case 1: {
                const result = await toggleTuning();
                if (result.error) {
                  showMessage(result.error);
                }
                break;
              }
              case 2: {
                setTextInput('New Profile', '', async (title: string): Promise<void> => {
                  const updated = await saveProfileLocal({
                    key: Guid.EMPTY,
                    title,
                    p: 350, 
                    i: 21, 
                    d: 4,
                    offset: 0,
                  });
                  if (updated) {
                    await editProfile(updated);
                  }
                });
                break;
              }
              case 3: {
                const profile = profiles[index];
                await setPromptInput(`Delete ${profile.title}?`, async () => {
                  const { error } = await deleteProfile(profile.key);
                  if (error) {
                    showMessage(error);
                  }
                  await refreshProfileMenu(index);
                });
                break;
              }
              }
            },
          },
        ]
      });
    },
  };
};

const editProfile = async (profile: IProfile): Promise<void> => {
  const menus = [...(state.menu || [])];
  menus.pop();
  setSharedState({
    menu: [
      ...menus, {
        current: 0,
        min: 0,
        max: 4,
        menuItems: [
          `Title:  ${profile.title}`,
          `P:      ${profile.p}`,
          `I:      ${profile.i}`,
          `D:      ${profile.d}`,
          `Offset: ${profile.offset}`,
        ],
        onClick: (editIndex): Promise<void> => {
          switch (editIndex) {
          case 0: {
            setTextInput('Profile Name', profile.title, async (text: string): Promise<void> => {
              await saveProfileLocal({...profile, title: text});
            });
            break;
          }
          case 1: {
            setNumberInput('Proportional Band', 0, 2000, profile.p, async (value: number): Promise<void> => {
              await saveProfileLocal({...profile, p: value});
            });
            break;
          }
          case 2: {
            setNumberInput('Integral Time', 0, 2000, profile.i, async (value: number): Promise<void> => {
              await saveProfileLocal({...profile, i: value});
            });
            break;
          }
          case 3: {
            setNumberInput('Derivative Time', 0, 2000, profile.d, async (value: number): Promise<void> => {
              await saveProfileLocal({...profile, d: value});
            });
            break;
          }
          case 4: {
            setNumberInput('Offset', -500, 500, profile.offset, async (value: number): Promise<void> => {
              await saveProfileLocal({...profile, offset: value});
            });
            break;
          }
          }          

          return Promise.resolve();
        },
      }
    ]
  });
};

const saveProfileLocal = async (profile: IProfile): Promise<IProfile|undefined> => {
  let current = 0;
  let updatedProfile: IProfile|undefined;
  if (profile) {
    const { error, updated } = await saveProfile(profile);
    if (error) {
      showMessage(error, Font.UbuntuMono_8ptFontInfo, 5000);
      return;
    }
    profiles = getProfiles();
    current = profiles.findIndex(p => p.key === profile?.key);
    if (current < 0) {
      current = 0;
    }
    updatedProfile = updated;
  }

  await refreshProfileMenu(current);

  return updatedProfile;
};

const refreshProfileMenu = async (current: number): Promise<void> => {
  profiles = getProfiles();
  await setSharedState({
    menu: state.menus?.[1]?.[0]
      ? [{
        ...state.menus[1][0],
        menuItems: profiles.map((p, index) => `${index === state.currentProfile ? '*' : ''} ${p.title}`),
        current,
        min: 0,
        max: profiles.length - 1,
      }] 
      : [],
    textinput: undefined,
    numberinput: undefined,
  });
};