import { Router } from 'express';
import { body } from 'express-validator';
import { checkForUpdates, restartService, reboot, updateTime } from '../controllers/systemController';

const router: Router = Router();

router.post('/restart', [], restartService);
router.post('/reboot', [], reboot);
router.post('/checkForUpdates', [], checkForUpdates);
router.post('/updateTime', [body('time').isNumeric()], updateTime);

export { router as systemRoute };

