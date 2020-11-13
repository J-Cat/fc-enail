import { Router } from 'express';
import { scan, updateNetwork } from '../controllers/networkController';
import { body } from 'express-validator';

const router: Router = Router();

router.get('/scan', [], scan);
router.post(
  '/update', 
  [
    body('mode').notEmpty().isIn(['ap', 'infrastructure']),
    body('ssid').notEmpty(),
    body('password').notEmpty(),
  ], 
  updateNetwork
);

export { router as networkRoute };
