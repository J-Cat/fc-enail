import { IEnailStore } from '../models/IEnailStore';
import { Store, Dispatch } from 'redux';
import { EnailAction } from '../models/Actions';

import * as Constants from '../models/constants';

import led from '../ui/led';
import oledUi from '../ui/oledUi';
import { home, gear, script } from '../ui/icons';

import { EnailMode, IEnailState } from '../models/IEnailState';
import { updateDisplay } from '../reducers/enailReducer';

import Debug from 'debug';
const debug = Debug("fc-enail:display");

export const displayMiddleware = (store: Store<IEnailStore>) => <A extends EnailAction>(next: Dispatch<A>) => (action: A) => {
    const result = next(action);

    const state = store.getState().enail;

    switch (action.type) {
        case Constants.SET_MODE: case Constants.SCRIPT_INCREASE: case Constants.SCRIPT_DECREASE: case Constants.NETWORK_INFO: {
            store.dispatch<any>(updateDisplay());
            break;
        }

        case Constants.DISPLAY_UPDATE: {
            debug(state.mode);
            render(state, action);
            break;
        }
    }

    return result;
}

export const render = (state: IEnailState, action: EnailAction) => {
    switch (state.mode) {
        case EnailMode.Home: {
            led.flash(0);
            oledUi.setIcon(home);
            break;
        }

        case EnailMode.Script: {
            led.flash(0);
            oledUi.setIcon(script);
            break;
        }

        case EnailMode.Settings: {
            led.flash(0);
            oledUi.setIcon(gear);
            break;
        }
    }
}
