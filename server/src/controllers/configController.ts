import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import { getQuickSet as dbGetQuickSet, setQuickSet } from '../utility/localDb';
import { saveConfig as saveConfigDao, getConfig as getConfigDao } from '../dao/configDao';
import { IConfig } from '../models/IConfig';

export const getConfig = async (req: Request, res: Response): Promise<Response> => {
  try {
    return res.status(HttpStatusCode.OK).json(getConfigDao());
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: e.message });
  }
};

export const saveConfig = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await saveConfigDao(req.body as IConfig);
    if (result.error) {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json( { error: result.error });
    }
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: e.message });
  }
};

export const getQuickSet = async (req: Request, res: Response): Promise<Response> => {
  try {
    const quickSet = dbGetQuickSet();
    return res.status(HttpStatusCode.OK).json(quickSet);
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: e.message });
  }
};

export const saveQuickSet = async (req: Request, res: Response): Promise<Response> => {
  try {
    const quickSet = req.body;
    await setQuickSet(quickSet);
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: e.message });
  }
};
