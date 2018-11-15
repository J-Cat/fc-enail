import { Dispatch, Store } from 'redux';
import { IEnailStore } from '../models/IEnailStore';
import * as Constants from '../models/constants';
import { EnailAction } from '../models/Actions';
import io from 'socket.io-client';
import { socketConnected, socketDisconnected, receiveEnailState, getScripts, getSavedState, connectSocket} from '../reducers/enailReducer';
import { IEnailEmitState } from 'src/models/IEnailEmitState';
import history from '../history';

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

        case Constants.RECONNECT: {
            history.push('connect');
            break;
        }

        case Constants.SERVICE_FOUND: {
            localStorage.setItem(Constants.LOCAL_STORAGE_FCENAIL_SERVICE_URL, action.payload as string);
            store.dispatch<any>(getScripts());
            store.dispatch<any>(getSavedState());
            store.dispatch<any>(connectSocket());
            break;
        }

        case Constants.SOCKET_CONNECTED: {
            history.push('home');
        }
    }

    next(action);
}