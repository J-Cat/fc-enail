import { Store, Dispatch } from 'redux';
import { fork } from 'child_process';
import Debug from 'debug';

import { IEnailStore } from '../models/IEnailStore';
import { EnailAction } from '../models/Actions';
import { IOledState } from '../models/IOledState';

const debug = Debug("fc-enail:display");

const oledUi = fork(`${__dirname}/../ui/oledUi.js`);

process.on('exit', () => {
    oledUi.kill();
});

export const displayMiddleware = (store: Store<IEnailStore>) => <A extends EnailAction>(next: Dispatch<A>) => (action: A) => {
    const result = next(action);
    const state = store.getState();

    const oledState: IOledState = {
        actionStep: state.menu.actionStep || 0,
        availableNetworks: state.menu.scan.map(n => n.ssid),
        currentMenu: state.menu.currentMenu,
        executing: state.menu.executing,
        flashRate: state.enail.flashRate,
        icon: state.enail.icon,
        input: state.menu.passphrase,
        isPassphrase: state.enail.passphrase !== '',
        menu: state.menu.menu,
        menuBottom: state.menu.bottom,
        menuTop: state.menu.top,
        mode: state.enail.mode,
        networkInfo: state.menu.networkInfo,
        passphrase: state.enail.passphrase,
        scriptRunning: state.enail.scriptRunning,
        scriptStartTime: state.enail.scriptStartTime,
        scriptTitle: state.enail.currentScript ? state.enail.currentScript.title : '',
        selectedIndex: state.menu.currentIndex,
        stepMessage: state.enail.currentStep ? state.enail.currentStep.message : '',
        lastUpdated: state.enail.lastUpdate,
        setPoint: state.enail.setPoint,
        presentValue: state.enail.presentValue
    };

    oledUi.send(oledState);

    return result;
}

