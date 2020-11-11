import { Server as HttpServer } from 'http';
import { authController } from './controllers/authController';
import { IE5ccState } from './hardware/e5cc';
import { Server, Socket } from 'socket.io';

const io = new Server();

export const socketApi = (server: HttpServer): void => {
  io.attach(server);

  // validate token
  io.on('connect', async (socket, next) => {
    const token = socket?.handshake?.query?.token;
    if (!token) {
      next(new Error('No authentication token was supplied.'));
      return;
    }

    try {
      const result = await authController.validateToken(token);
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

export const emit = (type: 'E5CC', data: IE5ccState): boolean => {
  try {
    io.emit(type, { data });
    return true;
  } catch (e) {
    console.error(`Socket IO Emit Error: ${e.message}`);
    return false;
  }
}