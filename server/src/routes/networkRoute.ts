import { Router } from 'express';
import { scan, updateNetwork, getNetworkInfo } from '../controllers/networkController';
import { body } from 'express-validator';

const router: Router = Router();

router.get('/', [], getNetworkInfo);
router.get('/scan', [], scan);
router.post(
  '/connect', 
  [
    body('mode').notEmpty().isIn(['ap', 'infrastructure']),
    body('ssid').notEmpty(),
    body('passcode').notEmpty(),
  ], 
  updateNetwork
);

export { router as networkRoute };
