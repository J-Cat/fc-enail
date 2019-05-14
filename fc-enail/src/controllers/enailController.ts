import * as HttpStatus from 'http-status-codes';
import store from '../store/createStore';
import { Request, Response, NextFunction } from 'express';
import { 
    setSP, toggleState, setCurrentScript, runScript, 
    endScript, persistSavedState, generatePassphrase, 
    verifyPassphrase, clearPassphrase, toggleTune, 
    getPidSettings, savePidSettings, persistProfiles, 
    deleteProfile, saveScript, deleteScript
} from '../reducers/enailReducer';
import { ISavedState } from '../models/ISavedState';
import { generateToken } from '../helpers/securityHelper';
import { IPidSettings } from '../models/IPidSettings';
import { ISavedProfiles } from '../models/ISavedProfiles';
import { IEnailScript } from '../models/IEnailScript';

export class EnailController {
    get = (req: Request, res: Response, next: NextFunction): void => {
        // res.status(HttpStatus.OK).send(store.getState().enail);
        res.sendStatus(HttpStatus.OK);
    }

    getScripts = (req: Request, res: Response, next: NextFunction): void => {
        res.status(HttpStatus.OK).send(store.getState().enail.scripts);
    }

    setSP = (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(setSP(req.params.value));
        res.sendStatus(HttpStatus.OK);
    }

    toggleState = (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(toggleState());
        res.sendStatus(HttpStatus.OK);
    }

    toggleTune = (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(toggleTune());
        res.sendStatus(HttpStatus.OK);
    }

    setScript = (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(setCurrentScript(req.params.index));
        res.sendStatus(HttpStatus.OK);
    }

    runScript = (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(runScript());
        res.sendStatus(HttpStatus.OK);
    }

    endScript = (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(endScript());
        res.sendStatus(HttpStatus.OK);
    }

    getSavedState = (req: Request, res: Response, next: NextFunction): void => {
        res.status(HttpStatus.OK).send({
            presets: store.getState().enail.presets,
            autoShutoff: store.getState().enail.autoShutoff
        });
    }

    persistSavedState = (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(persistSavedState(req.body as ISavedState));
        res.sendStatus(HttpStatus.OK);
    }

    saveScript = (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(saveScript(req.body as IEnailScript));
        res.sendStatus(HttpStatus.OK);
    }

    deleteScript = (req: Request, res: Response, next: NextFunction): void => {
        const { title } = req.body;
        store.dispatch<any>(deleteScript(title));
        res.sendStatus(HttpStatus.OK);
    } 

    getProfiles = (req: Request, res: Response, next: NextFunction): void => {
        res.status(HttpStatus.OK).send(store.getState().enail.profiles);
    }

    persistProfiles = (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(persistProfiles(req.body as ISavedProfiles));
        res.sendStatus(HttpStatus.OK);
    }

    deleteProfile = (req: Request, res: Response, next: NextFunction): void => {
        const { profile } = req.body;
        store.dispatch<any>(deleteProfile(profile));
        res.sendStatus(HttpStatus.OK);
    } 

    savePidSettings =  (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(savePidSettings(req.body as IPidSettings));
        res.sendStatus(HttpStatus.OK);
    }

    generatePassphrase = (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(generatePassphrase());
        res.sendStatus(HttpStatus.OK);
    }

    verifyPassphrase = (req: Request, res: Response, next: NextFunction): void => {
        const passphrase = (req.body as { passphrase: string }).passphrase;
        const success = store.getState().enail.passphrase === passphrase;

        let p = Promise.resolve('');
        if (success) {
            p = generateToken();
        }

        p.then(token => {
            res.status(HttpStatus.OK).send({
                success,
                token
            });
    
            if (success) {
                store.dispatch<any>(clearPassphrase());
            }
        });
    }

}