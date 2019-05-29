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
}

export interface IDispatchProps {
}

export interface IOwnProps {
}

export interface IProps extends RouteComponentProps<any>, IStateProps, IDispatchProps, IOwnProps {
}

export interface IState {
    readonly menuVisible: boolean;
}

function mapStateToProps(state: IEnailStore, ownProps: IOwnProps) {
    return {
    };
}

function mapDispatchToProps(dispatch: (...args: any[]) => void) {
    return {
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(withRouter(Settings));