import { Router } from 'express';
import { stateController } from '../controllers/stateController';
import { body } from 'express-validator';

export class StateRoute {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    private init(): void {
      this.router.get('/', [], stateController.get);
      this.router.post('/', [body().isJSON()], stateController.set);
    }
}

const route: StateRoute = new StateRoute();

const router: Router = route.router;

export { router as stateRoute };
export default router;
