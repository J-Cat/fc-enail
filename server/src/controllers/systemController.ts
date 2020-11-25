import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import { reboot as rebootDao, restartService as restartServiceDao } from '../dao/systemDao';

export const reboot = async (req: Request, res: Response): Promise<Response> => {
  try {
    await rebootDao();
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
    const err: Error = e as Error;

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
};

export const restartService = async (req: Request, res: Response): Promise<Response> => {
  try {
    await restartServiceDao();
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
    const err: Error = e as Error;

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
};
