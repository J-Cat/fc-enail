import makeRootReducer from '../reducers';
import {
    applyMiddleware,
    compose,
    createStore,
    Store
} from 'redux';
import thunk from 'redux-thunk';
import { apiMiddleware } from 'redux-api-middleware';

import { EnailAction } from '../models/Actions';
import { IEnailStore } from '../models/IEnailStore';
import { socketIoMiddleware } from './socketIoMiddleware';
import { reconnect } from '../reducers/enailReducer';
import { securityMiddleware, authorizationMiddleware } from './securityMiddleware';

export function configureStore(initialState?: IEnailStore): Store<IEnailStore, EnailAction> {
    const middlewares: any = [
        thunk,
        securityMiddleware,
        apiMiddleware,
        authorizationMiddleware,
        socketIoMiddleware
    ];

    const composeEnhancers = (typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

    const newState = initialState || {} as IEnailStore;
    const store: Store<IEnailStore, EnailAction> = createStore(makeRootReducer, newState,         
        composeEnhancers(applyMiddleware(...middlewares))
    );

    store.dispatch<any>(reconnect(true, false));
    
    return store;
}