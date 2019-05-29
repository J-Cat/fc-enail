/*
 * File: c:\fc-enail\fc-enail-client\src\routes\home\container.ts
 * Project: c:\fc-enail\fc-enail-client
 * Created Date: Sunday November 11th 2018
 * Author: J-Cat
 * -----
 * Last Modified:
 * Modified By:
 * -----
 * License: 
 *    This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 
 *    International License (http://creativecommons.org/licenses/by-nc/4.0/).
 * -----
 * Copyright (c) 2018
 */
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { IEnailStore } from '../../models/IEnailStore';
import { Home } from './home';
import { IEnailEmitState } from '../../models/IEnailEmitState';
import { IEnailScript } from '../../models/IEnailScript';
import { setSP, toggleState, runScript, endScript, setScript } from '../../reducers/enailReducer';
export interface IStateProps {
    readonly version: string;
    readonly state?: IEnailEmitState;
    readonly scripts: IEnailScript[];
    readonly presets: number[];
    readonly autoShutoff: number;
}

export interface IDispatchProps {
    setSP: (value: number) => void;
    toggleState: () => void;
    runScript: () => void;
    endScript: () => void;
    setScript: (index: number) => void;
}

export interface IOwnProps {
}

export interface IProps extends RouteComponentProps<any, any>, IStateProps, IDispatchProps, IOwnProps {
}

export interface IState {
    readonly changing: boolean;
    readonly sliderValue: number;
    readonly startingValue: number;
    readonly setPoint: number;
    readonly running: boolean;
    readonly scriptRunning: boolean;
    readonly currentScript: number;
    readonly scriptChanging: boolean;
    readonly showSPDialog: boolean;
    readonly runningChanging: boolean;
    readonly isMounted: boolean;
    readonly scripts: (IEnailScript & { deleted?: boolean })[];
}

function mapStateToProps(state: IEnailStore, ownProps: IOwnProps) {
    return {
        version: state.version.version,
        state: state.enail.emitState,
        scripts: state.enail.scripts || [],
        presets: state.enail.presets,
        autoShutoff: state.enail.autoShutoff
    };
}

function mapDispatchToProps(dispatch: (...args: any[]) => void) {
    return {
        setSP: (value: number) => dispatch(setSP(value)),
        toggleState: () => dispatch(toggleState()),
        runScript: () => dispatch(runScript()),
        endScript: () => dispatch(endScript()),
        setScript: (index: number) => dispatch(setScript(index))
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(withRouter(Home));