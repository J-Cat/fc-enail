import { Router } from 'express';
import { getConfig, getQuickSet, saveConfig, saveQuickSet } from '../controllers/configController';
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
router.get('/quickset', [], getQuickSet);
router.post('/quickset', [body().isArray()], saveQuickSet);

export { router as configRoute };
