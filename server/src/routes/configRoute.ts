import { Router } from 'express';
import { getConfig, saveConfig } from '../controllers/configController';
import { body } from 'express-validator';

const router: Router  = Router();

router.get('/', [], getConfig);
router.post(
  '/', [
    body('emailFrom').exists(),
    body('emailTo').exists(),
    body('autoShutoff').exists(),
    body('screenSaverTimeout').exists(),
    body('screenOffTimeout').exists(),
  ], 
  saveConfig,
);

export { router as configRoute };
