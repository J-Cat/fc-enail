import { Router } from 'express';
import { body } from 'express-validator';
import { getSounds, uploadSound, deleteSound } from '../controllers/soundsController';

const router: Router = Router();

router.get('/', [], getSounds);
router.post('/', [], uploadSound);
router.post('/delete', [body('key').notEmpty()], deleteSound);

export { router as soundsRoute };

