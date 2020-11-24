import { Router } from 'express';
import { deleteScript, getScripts, saveScript, setCurrentScript, runScript } from '../controllers/scriptController';
import { body } from 'express-validator';

const router: Router = Router();

router.get('/', [], getScripts);
router.post(
  '/', 
  [
    body().isJSON()
  ], 
  saveScript,
);
router.post('/setCurrent', [body('key').notEmpty()], setCurrentScript);
router.post('/delete', [body('key').notEmpty()], deleteScript);
router.post('/run', [body('key').notEmpty()], runScript);

export { router as scriptRoute };
