import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import { 
  getNetworkInfo as getNetworkInfoDao,
  scan as scanDao,
  updateNetwork as updateNetworkDao,
} from '../dao/networkDao';
import { resolvePtr } from 'dns';

export const getNetworkInfo = async (req: Request, res: Response): Promise<Response> => {
  return new Promise(async resolve => {
    try {
      const result = await getNetworkInfoDao();
      if (result.error) {
        resolve(res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(result));
        return;
      }
      resolve(res.status(HttpStatusCode.OK).json(result.network));
    } catch (e) {
      resolve(
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ error: { message: e.message, stack: e.stack } })
      );
    }
  })
}

export const scan = async (req: Request, res: Response): Promise<Response> => {
  return new Promise(async resolve => {
    try {
      const result = await scanDao();
      if (result.error) {
        resolve(res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(result));
        return;
      }
      resolve(res.status(HttpStatusCode.OK).json(result.ssids));
    } catch (e) {
      resolve(
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ error: { message: e.message, stack: e.stack } })
      );
    }
  })
}

export const updateNetwork = async (req: Request, res: Response): Promise<Response> => {
  return new Promise(async resolve => {
    try {
      const mode = req.body.mode;
      const ssid = req.body.ssid;
      const passcode = req.body.passcode;
      const result = await updateNetworkDao(mode, ssid, passcode);
      if (result.error) {
        resolve(res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(result));
        return;
      }
      resolve(res.status(HttpStatusCode.OK).json(result));
    } catch (e) {
      resolve(
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ error: { message: e.message, stack: e.stack } })
      );
    }
  })
}