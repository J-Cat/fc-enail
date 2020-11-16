import { Server as HttpServer } from 'http';
import { validateToken } from './controllers/authController';
import { getPidSettings, IE5ccState } from './hardware/e5cc';
import { Server, Socket } from 'socket.io';
import { getCurrentProfile, getProfile, IProfile } from './utility/localDb';
import { registerStateChange } from './utility/sharedState';

const io = new Server();

registerStateChange('socketio', async (oldState, newState, source) => {
  if (
    oldState?.tuning !== undefined && newState.tuning !== undefined
    && oldState?.tuning !== newState.tuning && !newState.tuning
  ) {
    const pid = await getPidSettings()
    if (pid) {
      let profile = getProfile(getCurrentProfile());

      if (profile) {
        emitPidSettings({
          ...profile,
          ...pid,
        });
      }  
    }
  }
})

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
}

export const emitE5cc = (data: IE5ccState): boolean => {
  try {
    io.emit('E5CC', data);
    return true;
  } catch (e) {
    console.error(`Socket IO Emit Error: ${e.message}`);
    return false;
  }
}

export const emitPidSettings = (profile: IProfile): boolean => {
  try {
    io.emit('PID', profile);
    return true;
  } catch (e) {
    console.error(`Socket IO Emit Error: ${e.message}`);
    return false;
  }
}