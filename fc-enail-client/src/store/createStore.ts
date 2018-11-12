import makeRootReducer from '../reducers';
import {
    applyMiddleware,
    compose,
    createStore,
    Store
} from 'redux';

import { EnailAction } from 'src/models/Actions';
import { IEnailStore } from 'src/models/IEnailStore';
import { socketIoMiddleware } from './socketIoMiddleware';
import { connectSocket, getScripts } from 'src/reducers/enailReducer';
import { apiMiddleware } from 'redux-api-middleware';
import thunk from 'redux-thunk';

export function configureStore(initialState?: IEnailStore): Store<IEnailStore, EnailAction> {
    const middlewares: any = [
        thunk,
        apiMiddleware,
        socketIoMiddleware
    ];

    const composeEnhancers = (typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

    const newState = initialState || {} as IEnailStore;
    const store: Store<IEnailStore, EnailAction> = createStore(makeRootReducer, newState,         
        composeEnhancers(applyMiddleware(...middlewares))
    );

    store.dispatch<any>(getScripts());
    store.dispatch<any>(connectSocket());
    
    return store;
}