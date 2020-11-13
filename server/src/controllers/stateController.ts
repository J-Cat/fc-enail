import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import jwt from 'jsonwebtoken'
import { getSharedState, ISharedState, setSharedState } from '../utility/sharedState';
import { generate } from 'generate-password';

const BEARER_PREFIX = 'bearer ';

export const getState = async (req: Request, res: Response): Promise<Response> => {
  try {
    const state: ISharedState = {
      ...(await getSharedState()),
      passcode: undefined,
    };

    return res.status(HttpStatusCode.OK).json(state);
  } catch (e) {
      const err: Error = e as Error;

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
}

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
}
