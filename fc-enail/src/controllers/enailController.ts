import * as HttpStatus from 'http-status-codes';
import store from '../store/createStore';
import { Request, Response, NextFunction } from 'express';
import { setSP, toggleState, setCurrentScript, runScript, endScript } from '../reducers/enailReducer';

export class EnailController {
    get = (req: Request, res: Response, next: NextFunction): void => {
        res.status(HttpStatus.OK).send(store.getState().enail);
    }

    setSP = (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(setSP(req.params.value));
        res.sendStatus(HttpStatus.OK);
    }

    toggleState = (req: Request, res: Response, next: NextFunction): void => {
        store.dispatch<any>(toggleState());
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
}