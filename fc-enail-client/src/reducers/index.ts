import { combineReducers, Reducer } from 'redux';
import { IEnailStore } from 'src/models/IEnailStore';
import { enailReducer } from './enailReducer';
import { versionReducer } from './versionReducer';

const makeRootReducer: Reducer<IEnailStore> = 
    combineReducers({
        enail: enailReducer,
        version: versionReducer
    });

export default makeRootReducer;