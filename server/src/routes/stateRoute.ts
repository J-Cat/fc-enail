import { Router } from 'express';
import { getState, setState, url } from '../controllers/stateController';
import { body } from 'express-validator';

const router: Router = Router();

router.get('/', [], getState);
router.post('/', [body().isJSON()], setState);
router.get('/url', [], url);

export { router as stateRoute };

