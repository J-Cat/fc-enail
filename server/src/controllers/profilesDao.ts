import { getPidSettings, setPidSettings, toggleE5ccTuning } from '../hardware/e5cc';
import { 
  getCurrentProfile, 
  getProfile, 
  getProfiles as getLocalDbProfiles, 
  IProfile, 
  setCurrentProfile as setLocalDbCurrentProfile, 
  setProfile,
  deleteProfile as deleteLocalDbProfile,
} from '../dao/localDb';
import { Guid } from 'guid-typescript';
import { setSharedState } from '../utility/sharedState';

export const getProfiles = async (): Promise<{ error?: string, currentProfile?: string, profiles?: IProfile[] }> => {
  try {
    let currentProfile = getCurrentProfile();
    let profiles = getLocalDbProfiles();
    if (profiles.length === 0) {
      const currentPidSettings = await getPidSettings();
      if (currentPidSettings) {
        const profile = await setProfile({ 
          key: Guid.createEmpty().toString(),
          title: 'Default',
          ...currentPidSettings,
        });
        profiles = [profile];
        currentProfile = profile.key;
        await setLocalDbCurrentProfile(currentProfile);
      }
    }

    return { currentProfile, profiles };
  } catch (e) {
    return { error: e.message };
  }
};

export const saveProfile = async (profile: IProfile): Promise<{ error?: string, updated?: IProfile }> => {
  try {
    const currentProfile = getCurrentProfile();
    const updated = await setProfile(profile);
    if (currentProfile === profile.key) {
      await setPidSettings(profile.p, profile.i, profile.d, profile.offset);      
    }
    return { updated };
  } catch (e) {
    return { error: e.message };
  }
};

export const setCurrentProfile = async (key: string): Promise<{ error?: string }> => {
  try {
    const { index, profile } = getProfile(key);
    if (!profile) {
      throw new Error('The profile you specified does not exist.');
    }
    await setLocalDbCurrentProfile(key);
    await setPidSettings(profile.p, profile.i, profile.d, profile.offset);
    await setSharedState({
      currentProfile: index,
    });
    return {};
  } catch (e) {
    return { error: e.message };
  }
};

export const deleteProfile = async (key: string): Promise<{ error?: string }> => {
  try {
    const { profile } = getProfile(key);
    if (!profile) {
      throw new Error('The profile you specified does not exist.');
    }
    await deleteLocalDbProfile(key);
    return {};
  } catch (e) {
    return { error: e.message };
  }
};

export const toggleTuning = async (): Promise<{ error?: string }> => {
  try {
    await toggleE5ccTuning();
    return {};
  } catch (e) {
    return { error: e.message };
  }
};
