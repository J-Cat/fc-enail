import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import { getUrl } from '../dao/localDb';
import { getSharedState, setSharedState } from '../dao/sharedState';
import { ISharedState } from '../models/ISharedState';

export const getState = async (req: Request, res: Response): Promise<Response> => {
  try {
    const state: ISharedState = {
      ...(await getSharedState()),
      url: getUrl(),
      passcode: undefined,
    };

    return res.status(HttpStatusCode.OK).json(state);
  } catch (e) {
    const err: Error = e as Error;

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
};

export const setState = async (req: Request, res: Response): Promise<Response> => {
  try {
    const newState = req.body;
    const { lastState, state } = await setSharedState(newState);
    return res.status(HttpStatusCode.OK).json([lastState, state]);
  } catch (e) {
    const err: Error = e as Error;

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
};

export const url = async (req: Request, res: Response): Promise<Response> => {
  try {
    return res.status(HttpStatusCode.OK).json({ url: getUrl() });
  } catch (e) {
    const err: Error = e as Error;

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
};
