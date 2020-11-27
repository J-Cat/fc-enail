import { Server as HttpServer } from 'http';
import { validateToken } from './controllers/authController';
import { getPidSettings } from './hardware/e5cc';
import { IE5ccState } from './models/IE5ccState';
import { Server } from 'socket.io';
import { getCurrentProfile, getProfile } from './dao/localDb';
import { registerStateChange } from './dao/sharedState';
import { IProfile } from './models/IProfile';
import { IScriptFeedback } from './models/IScriptFeedback';
const io = new Server();

registerStateChange('socketio', async (oldState, newState): Promise<void> => {
  if (
    oldState?.tuning !== undefined && newState.tuning !== undefined
    && oldState?.tuning !== newState.tuning && !newState.tuning
  ) {
    const pid = await getPidSettings();
    if (pid) {
      const { profile } = getProfile(getCurrentProfile());

      if (profile) {
        emitPidSettings({
          ...profile,
          ...pid,
        });
      }  
    }
  }
});

export const socketApi = (server: HttpServer): void => {
  io.attach(
    server, { 
      cors: {
        origin: '*',
      },
    },
  );

  // validate token
  io.use(async (socket, next) => {
    const token = (socket?.handshake.auth as { token: string })?.token;
    if (!token) {
      next(new Error('No authentication token was supplied.'));
      return;
    }

    try {
      const result = await validateToken(token);
      if (!result.success) {
        next(new Error(`Failed to authenticate token: ${result.message}`));
        return;
      }
    } catch (e) {
      next(new Error(`An error occurred validating your token: ${e.message}`));
    }
    next();
  });
};

export const emitE5cc = (data: IE5ccState & { scriptRunning: boolean, scriptFeedback?: IScriptFeedback }): boolean => {
  try {
    io.emit('E5CC', data);

    return true;
  } catch (e) {
    console.error(`Socket IO Emit Error: ${e.message}`);
    return false;
  }
};

export const emitPidSettings = (profile: IProfile): boolean => {
  try {
    io.emit('PID', profile);
    return true;
  } catch (e) {
    console.error(`Socket IO Emit Error: ${e.message}`);
    return false;
  }
};