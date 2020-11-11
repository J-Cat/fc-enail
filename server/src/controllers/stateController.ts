import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import jwt from 'jsonwebtoken'
import { getSharedState, setSharedState } from '../utility/sharedState';
import { generate } from 'generate-password';

const BEARER_PREFIX = 'bearer ';

export class StateController {
  async get(req: Request, res: Response): Promise<Response> {
    try {
      const state = await getSharedState();
      return res.status(HttpStatusCode.OK).json(state);
    } catch (e) {
        const err: Error = e as Error;

        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
            .json({ message: err.message, error: { message: err.message, stack: err.stack } });
    }
  }

  async set(req: Request, res: Response): Promise<Response> {
    try {
      const state = req.body;
      await setSharedState(state);
      return res.sendStatus(HttpStatusCode.OK);
    } catch (e) {
        const err: Error = e as Error;

        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
            .json({ message: err.message, error: { message: err.message, stack: err.stack } });
    }
  }
}
const stateController: StateController = new StateController();

export { stateController };
export default stateController;