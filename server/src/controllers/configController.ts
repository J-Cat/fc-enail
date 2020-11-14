import { Request, Response } from 'express';
import { readFile, stat, writeFile } from 'fs';
import HttpStatusCode from 'http-status-codes';
import { registerConfigChange, loadConfig } from '../config';
import { getQuickSet as dbGetQuickSet, setQuickSet } from '../utility/localDb';

let Config = registerConfigChange(newConfig => {
  Config = newConfig;
});

export const getConfig = async (req: Request, res: Response): Promise<Response> => {
  try {
    const config = {
      autoShutoff: Config.e5cc.autoShutoff,
      screenSaverTimeout: Config.display.screenSaverTimeout,
      screenOffTimeout: Config.display.screenOffTimeout,
      max: Config.encoder.maxValue,
      min: Config.encoder.minValue,
      localtunnel: Config.localtunnel.subdomain,
    };

    return res.status(HttpStatusCode.OK).json(config);
  } catch (e) {
      const err: Error = e as Error;

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
}

export const saveConfig = async (req: Request, res: Response): Promise<Response> => {
  try {
    const autoShutoff = req.body.autoShutoff;
    const screenSaverTimeout = req.body.screenSaverTimeout;
    const screenOffTimeout = req.body.screenOffTimeout;
    const max = req.body.max;
    const min = req.body.min;
    const localtunnel = req.body.localtunnel;
    
    const exists = await new Promise(resolve => stat('./.env', err => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    }));
    let newEnv = '';
    if (exists) {
      await new Promise(resolve => readFile('./.env', { encoding: 'utf8' }, (err, data) => {
        if (!err) {
          const lines = data.split('\n');
          for (const line of lines) {
            if (!line?.trim()) {
              continue;
            }
            const [key] = line.split('=');
            if (
              [
                'E5CC_AUTOSHUTOFF', 'DISPLAY_SCREEN_SAVER', 'DISPLAY_SCREEN_OFF', 
                'ENCODER_MIN_VALUE', 'ENCODER_MAX_VALUE', 'LOCALTUNNEL_SUBDOMAIN',
              ].includes(key.trim())
            ) {
              continue;
            }
            newEnv += line + '\n';
          }      
        }
        resolve();
      }));
    }
    newEnv += `E5CC_AUTOSHUTOFF=${autoShutoff}\n`
      + `DISPLAY_SCREEN_SAVER=${screenSaverTimeout}\n`
      + `DISPLAY_SCREEN_OFF=${screenOffTimeout}\n`
      + `ENCODER_MIN_VALUE=${min}\n`
      + `ENCODER_MAX_VALUE=${max}\n`
      + `LOCALTUNNEL_SUBDOMAIN=${localtunnel}\n`;
    
    await new Promise(resolve => writeFile('./.env', newEnv, { encoding: 'utf8' }, err => {
      if (err) {
        throw err;
      }
      resolve();
    }));

    loadConfig(newEnv);

    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
    const err: Error = e as Error;

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
}

export const getQuickSet = async (req: Request, res: Response): Promise<Response> => {
  try {
    const quickSet = dbGetQuickSet();
    return res.status(HttpStatusCode.OK).json(quickSet);
  } catch (e) {
      const err: Error = e as Error;

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
}

export const saveQuickSet = async (req: Request, res: Response): Promise<Response> => {
  try {
    const quickSet = req.body;
    await setQuickSet(quickSet);
    return res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
      const err: Error = e as Error;

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
}
