import { Router } from 'express';
import { reboot, restartService } from '../dao/systemDao';

const router: Router = Router();

router.post('/restart', [], restartService);
router.post('/reboot', [], reboot);

export { router as systemRoute };

