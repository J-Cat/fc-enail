import { Router } from 'express';
import { networkController } from '../controllers/networkController';
import { body } from 'express-validator';

export class NetworkRoute {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    private init(): void {
      this.router.get('/scan', [], networkController.scan);
      this.router.post(
        '/update', 
        [
          body('mode').notEmpty().isIn(['ap', 'infrastructure']),
          body('ssid').notEmpty(),
          body('password').notEmpty(),
        ], 
        networkController.updateNetwork
      );
    }
}

const route: NetworkRoute = new NetworkRoute();

const router: Router = route.router;

export { router as networkRoute };
export default router;
