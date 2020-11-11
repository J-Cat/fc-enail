import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import jwt from 'jsonwebtoken'
import { getSharedState, setSharedState } from '../utility/sharedState';
import { generate } from 'generate-password';

const BEARER_PREFIX = 'bearer ';

export class AuthController {
  async generatePasscode(req: Request, res: Response): Promise<Response> {
    await setSharedState({
      passcode: generate({
        length: 8,
        numbers: true,
        symbols: true,
        uppercase: true
      }),
    });
    return res.sendStatus(HttpStatusCode.OK);
  }

  async authenticate(req: Request, res: Response): Promise<Response> {
    try {
      if (!process.env.API_JWT_PRIVATE_KEY || !process.env.API_JWT_PUBLIC_CERT) {
        throw new Error('JWT private key and public certificate are missing.');
      }
 
      const passphrase: string = req.body.passphrase;
      const state = await getSharedState();
      if (passphrase !== state?.passcode) {
        return res.status(HttpStatusCode.UNAUTHORIZED)
            .json({ error: 'Failed to verify the supplied passphrase.' });
      }
      const token: string = jwt.sign(
        {},
        process.env.API_JWT_PRIVATE_KEY,
        {
            algorithm: 'RS256',
            expiresIn: process.env.API_JWT_EXPIRES_IN || '7d',
        },
      );

      await setSharedState({ passcode: '' });

      return res.status(HttpStatusCode.OK).json({
        token,
      });
    } catch (e) {
        const err: Error = e as Error;

        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
            .json({ message: err.message, error: { message: err.message, stack: err.stack } });
    }
  }


  async validateToken(token: string): Promise<{ success: boolean; message?: string; decoded?: string }> {
    // decode token
    if (token) {
        let userToken: string = token;

        if (userToken.toLowerCase().startsWith(BEARER_PREFIX)) {
            userToken = token.substring(BEARER_PREFIX.length);
        }

        return new Promise(resolve => {
          if (!process.env.API_JWT_PUBLIC_CERT) {
            return { success: false, message: 'No public certificate to decode token exists.' };
          }

          jwt.verify(userToken, process.env.API_JWT_PUBLIC_CERT, { algorithms: ['RS256'], ignoreExpiration: false }, (err): void => {
              if (err) {
                resolve({
                  message: 'Failed to authenticate token.',
                  success: false,
                });
              } else {
                // if everything is good, return decoded token
                resolve({
                  success: true,
                });
              }
            });
      })
    } else {
      // if there is no token
      // return an error
      return {
          message: 'No token provided.',
          success: false,
      };
    }
  }

}

const authController: AuthController = new AuthController();

export { authController };
export default authController;