import { Dispatch, Store } from 'redux';
import { IEnailStore } from '../models/IEnailStore';
import * as Constants from '../models/constants';
import { EnailAction } from '../models/Actions';
import io from 'socket.io-client';
import { socketConnected, socketDisconnected, receiveEnailState } from '../reducers/enailReducer';
import { IEnailEmitState } from 'src/models/IEnailEmitState';

export const socketIoMiddleware = (store: Store<IEnailStore>) => <A extends EnailAction>(next: Dispatch<A>) => (action: A) => {
    // broadcast posts from MTU/ECC or from another controller diretly to SocketIO
    switch (action.type) {
        case Constants.SOCKET_CONNECT: {
            const socketIo = io(localStorage.getItem(Constants.LOCAL_STORAGE_FCENAIL_SERVICE_URL) as string, {
            });
            socketIo.connect();
            socketIo.on('connect', () => {
                store.dispatch(socketConnected())
            });
            socketIo.on('disconnect', () => {
                store.dispatch(socketDisconnected())
            });
            socketIo.on(Constants.SOCKET_EMIT_STATE, (reading: IEnailEmitState) => {
                store.dispatch(receiveEnailState(reading));
            });
            break;
        }
    }

    next(action);
}