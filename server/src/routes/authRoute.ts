import { Router } from 'express';
import { authenticate, generatePasscode } from '../controllers/authController';
import { body } from 'express-validator';

const router: Router  = Router();

router.post('/passcode', [body('passphrase').notEmpty()], generatePasscode);
router.post('/login', [body('passphrase').notEmpty()], authenticate);

export { router as authRoute };
