import { Router } from 'express';
import { getState, setState } from '../controllers/stateController';
import { body } from 'express-validator';

const router: Router = Router();

router.get('/', [], getState);
router.post('/', [body().isJSON()], setState);

export { router as stateRoute };

