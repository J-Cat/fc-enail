import { Router } from 'express';
import { authController } from '../controllers/authController';
import { body } from 'express-validator';

export class AuthRoute {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    private init(): void {
      this.router.post('/passcode', [body('passphrase').notEmpty()], authController.generatePasscode);
      this.router.post('/login', [body('passphrase').notEmpty()], authController.authenticate);
    }
}

const route: AuthRoute = new AuthRoute();

const router: Router = route.router;

export { router as authRoute };
export default router;
