import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import { registerConfigChange } from '../config';
import { getPidSettings, setPidSettings, toggleE5ccTuning } from '../hardware/e5cc';
import { 
  getCurrentProfile, 
  getProfile, 
  getProfiles as getLocalDbProfiles, 
  IProfile, 
  setCurrentProfile as setLocalDbCurrentProfile, 
  setProfile 
} from '../utility/localDb';
import { Guid } from 'guid-typescript';

let Config = registerConfigChange(newConfig => {
  Config = newConfig;
});

export const getProfiles = async (req: Request, res: Response): Promise<Response> => {
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

    return res.status(HttpStatusCode.OK).json({ currentProfile, profiles });
  } catch (e) {
      const err: Error = e as Error;

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
}

export const saveProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const profile: IProfile = req.body;
    const currentProfile = getCurrentProfile();
    const updated = await setProfile(profile);
    if (currentProfile === profile.key) {
      await setPidSettings(profile.p, profile.i, profile.d);      
    }
    return res.status(HttpStatusCode.OK).json(updated);
  } catch (e) {
      const err: Error = e as Error;

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
}

export const setCurrentProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const key: string = req.body.key;
    const profile = getProfile(key);
    if (!profile) {
      throw new Error('The profile you specified does not exist.');
    }
    await setLocalDbCurrentProfile(key);
    await setPidSettings(profile.p, profile.i, profile.d);
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
      const err: Error = e as Error;

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
}

export const toggleTuning = async (req: Request, res: Response): Promise<Response> => {
  try {
    await toggleE5ccTuning();
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
      const err: Error = e as Error;

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
}
