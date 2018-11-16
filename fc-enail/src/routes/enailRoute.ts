import { EnailController } from '../controllers/enailController';
import { Router } from 'express';

export class EnailRoute {
    router: Router;
    controller: EnailController;

    constructor() {
        this.controller = new EnailController();
        this.router = Router();

        this.router.get('/', this.controller.get);
        this.router.post('/sp/:value', this.controller.setSP);
        this.router.post('/state', this.controller.toggleState);
        this.router.get('/scripts', this.controller.getScripts);
        this.router.post('/script/set/:index', this.controller.setScript);
        this.router.post('/script/run', this.controller.runScript);
        this.router.post('/script/end', this.controller.endScript);
        this.router.get('/savedstate', this.controller.getSavedState);
        this.router.post('/savedstate', this.controller.persistSavedState);
        this.router.post('/passphrase/generate', this.controller.generatePassphrase);
        this.router.post('/passphrase/verify', this.controller.verifyPassphrase);
    }
}