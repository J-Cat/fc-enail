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
        this.router.post('/script/set/:index', this.controller.setScript);
        this.router.post('/script/run', this.controller.runScript);
        this.router.post('/script/end', this.controller.endScript);
    }
}