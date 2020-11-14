import { Router } from 'express';
import { getProfiles, saveProfile, setCurrentProfile, toggleTuning } from '../controllers/profileController';
import { body } from 'express-validator';

const router: Router = Router();

router.get('/', [], getProfiles);
router.post(
  '/', 
  [
    body().isJSON()
  ], 
  saveProfile,
);
router.post('/setCurrent', [body('key').notEmpty()], setCurrentProfile);
router.post('/tuning', [], toggleTuning);

export { router as profileRoute };
