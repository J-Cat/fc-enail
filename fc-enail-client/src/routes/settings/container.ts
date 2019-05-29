/*
 * File: c:\fc-enail\fc-enail-client\src\routes\settings\container.ts
 * Project: c:\fc-enail\fc-enail-client
 * Created Date: Tuesday November 13th 2018
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
import Settings from './settings';
import { IEnailEmitState } from '../../models/IEnailEmitState';
import { ISavedState } from '../../models/ISavedState';
import { persistSavedState, toggleTuning, savePidSettings, deleteProfile } from '../../reducers/enailReducer';
import { IPidSettings } from '../../models/IPidSettings';

export interface IStateProps {
    readonly version: string;
    readonly state?: IEnailEmitState;
    readonly presets: number[];
    readonly autoShutoff: number;
    readonly p: number;
    readonly i: number;
    readonly d: number;
    readonly profile: string;
    readonly profiles: {
        [profile: string]: IPidSettings;
    };
}

export interface IDispatchProps {
    persistSavedState: (savedState: ISavedState) => void;
    toggleTuning: () => void;
    savePidSettings: (settings: IPidSettings) => void;
    deleteProfile: (profile: string) => void;
}

export interface IOwnProps {
}

export interface IProps extends RouteComponentProps<any>, IStateProps, IDispatchProps, IOwnProps {
}

export interface IState {
    readonly presets: {
        [index: number]: {
            value: number;
            validationStatus: 'success'|'warning'|'error'|'validating'|undefined;
            errorMsg: string|undefined;    
        }
    };
    readonly autoShutoff: number;
    readonly p: number;
    readonly i: number;
    readonly d: number;
    readonly start: {
        readonly p: number;
        readonly i: number;
        readonly d: number;
        readonly profile: string;
    }
    readonly profile: string;
    readonly menuVisible: boolean;
    readonly mouseEvent?: MouseEvent;
}

function mapStateToProps(state: IEnailStore, ownProps: IOwnProps) {
    return {
        version: state.version.version,
        state: state.enail.emitState,
        p: state.enail.emitState ? state.enail.emitState.p : 0,
        i: state.enail.emitState ? state.enail.emitState.i : 0,
        d: state.enail.emitState ? state.enail.emitState.d : 0,
        presets: state.enail.presets,
        autoShutoff: state.enail.autoShutoff,
        profile: state.enail.emitState ? state.enail.emitState.profile || '' : state.enail.profiles.currentProfile || '',
        profiles: state.enail.profiles.profiles
    };
}

function mapDispatchToProps(dispatch: (...args: any[]) => void) {
    return {
        persistSavedState: (savedState: ISavedState) => dispatch(persistSavedState(savedState)),
        toggleTuning: () => dispatch(toggleTuning()),
        savePidSettings: (settings: IPidSettings) => dispatch(savePidSettings(settings)),
        deleteProfile: (profile: string) => dispatch(deleteProfile(profile))
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(withRouter(Settings));