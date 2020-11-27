import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import {
  getProfiles as getProfilesDao,
  deleteProfile as deleteProfileDao,
  saveProfile as saveProfileDao,
  setCurrentProfile as setCurrentProfileDao,
  toggleTuning as toggleTuningDao,
} from '../dao/profilesDao';
import { IProfile } from '../models/IProfile';

export const getProfiles = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { error, currentProfile, profiles } =  await getProfilesDao();
    if (error) {
      throw new Error(error);
    }

    return res.status(HttpStatusCode.OK).json({ currentProfile, profiles });
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: e.message });
  }
};

export const saveProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const profile: IProfile = req.body;
    const { error, updated } = await saveProfileDao(profile);
    if (error) {
      throw new Error(error);
    }
    return res.status(HttpStatusCode.OK).json(updated);
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: e.message });
  }
};

export const setCurrentProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const key: string = req.body.key;
    const { error } = await setCurrentProfileDao(key);
    if (error) {
      throw new Error(error);
    }
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: e.message });
  }
};

export const deleteProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const key: string = req.body.key;
    const { error } = await deleteProfileDao(key);
    if (error) {
      throw new Error(error);
    }
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: e.message });
  }
};

export const toggleTuning = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { error } = await toggleTuningDao();
    if (error) {
      throw new Error(error);
    }
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: e.message });
  }
};
