import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import {
  getScripts as getScriptsDao,
  deleteScript as deleteScriptDao,
  saveScript as saveScriptDao,
  setCurrentScript as setCurrentScriptDao,
  runScript as runScriptDao,
} from '../dao/scriptsDao';
import { IScript } from '../models/IScript';

export const getScripts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { error, currentScript, scripts } =  await getScriptsDao();
    if (error) {
      throw new Error(error);
    }

    return res.status(HttpStatusCode.OK).json({ currentScript, scripts });
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: e.message });
  }
};

export const saveScript = async (req: Request, res: Response): Promise<Response> => {
  try {
    const script: IScript = req.body;
    const { error, updated } = await saveScriptDao(script);
    if (error) {
      throw new Error(error);
    }
    return res.status(HttpStatusCode.OK).json(updated);
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: e.message });
  }
};

export const setCurrentScript = async (req: Request, res: Response): Promise<Response> => {
  try {
    const key: string = req.body.key;
    const { error } = await setCurrentScriptDao(key);
    if (error) {
      throw new Error(error);
    }
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: e.message });
  }
};

export const deleteScript = async (req: Request, res: Response): Promise<Response> => {
  try {
    const key: string = req.body.key;
    const { error } = await deleteScriptDao(key);
    if (error) {
      throw new Error(error);
    }
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: e.message });
  }
};

export const runScript = async (req: Request, res: Response): Promise<Response> => {
  try {
    const key: string = req.body.key;
    await runScriptDao(key);
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: e.message });
  }
};
