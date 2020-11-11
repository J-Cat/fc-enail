import { Server } from 'http';
import { authorize } from 'socketio-jwt';
import { IE5ccState } from './hardware/e5cc';
const socketio = require('socket.io');

const io = socketio();

export const socketApi = (server: Server): void => {
  io.attach(server);
  // io.use(authorize({
  //   secret: process.env.JWT_PUBLIC_CERT || '',
  //   handshake: true,
  // }));
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