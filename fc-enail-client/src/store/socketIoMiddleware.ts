import { Dispatch, Store } from 'redux';
import io from 'socket.io-client';
import { 
    connectSocket, socketConnected, socketDisconnected, 
    receiveEnailState, 
    getScripts, getSavedState,  
    generatePassphrase, 
    loadToken, tokenLoaded
} from '../reducers/enailReducer';
import history from '../history';
import { IEnailStore } from '../models/IEnailStore';
import * as Constants from '../models/constants';
import { EnailAction } from '../models/Actions';
import { IEnailEmitState } from '../models/IEnailEmitState';
import { IVerifyTokenResponse } from '../models/IVerifyTokenResponse';

export const socketIoMiddleware = (store: Store<IEnailStore>) => <A extends EnailAction>(next: Dispatch<A>) => (action: A) => {
    // broadcast posts from MTU/ECC or from another controller diretly to SocketIO
    const result = next(action);

    switch (action.type) {
        case Constants.SOCKET_CONNECT: {
            const socketIo = io(localStorage.getItem(Constants.LOCAL_STORAGE_FCENAIL_SERVICE_URL) as string, {
                query: 'token=' + store.getState().enail.token
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
            const key = localStorage.getItem(Constants.LOCAL_STORAGE_FCENAIL_KEY);
            if (!key) {
                store.dispatch<any>(generatePassphrase());
                history.push('signin');
            } else {
                store.dispatch<any>(loadToken(key));
            }
            break;
        }

        case Constants.PASSPHRASE_VERIFY_RESPONSE: {
            const response = action.payload as IVerifyTokenResponse;
            if (response.success) {
                localStorage.setItem(Constants.LOCAL_STORAGE_FCENAIL_KEY, response.token);
                store.dispatch<any>(tokenLoaded());
            }
            break;
        }

        case Constants.LOAD_TOKEN: {
            store.dispatch(tokenLoaded());
            break;
        }

        case Constants.TOKEN_LOADED: {
            store.dispatch<any>(getScripts());
            store.dispatch<any>(getSavedState());
            store.dispatch<any>(connectSocket());
            break;
        }

        case Constants.SOCKET_CONNECTED: {
            history.push('home');
            break;
        }
    }

    return result;
}