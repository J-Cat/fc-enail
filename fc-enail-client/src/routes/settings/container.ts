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
import { FormComponentProps } from 'antd/lib/form';

import { IEnailStore } from '../../models/IEnailStore';
import Settings from './settings';
import { IEnailEmitState } from '../../models/IEnailEmitState';
import { ISavedState } from '../../models/ISavedState';
import { persistSavedState } from '../../reducers/enailReducer';

export namespace SettingsProps {
    export interface IStateProps {
        readonly version: string;
        readonly state?: IEnailEmitState;
        readonly presets: number[];
    }

    export interface IDispatchProps {
        persistSavedState: (savedState: ISavedState) => void;
    }

    export interface IOwnProps {
    }

    export interface IProps extends RouteComponentProps<any>, FormComponentProps, IStateProps, IDispatchProps, IOwnProps {
    }

    export interface IState {
        readonly presets: {
            [index: number]: {
                value: number;
                validationStatus: 'success'|'warning'|'error'|'validating'|undefined;
                errorMsg: string|undefined;    
            }
        };
    }
}

function mapStateToProps(state: IEnailStore, ownProps: SettingsProps.IOwnProps) {
    return {
        version: state.version.version,
        state: state.enail.emitState,
        presets: state.enail.presets
    };
}

function mapDispatchToProps(dispatch: (...args: any[]) => void) {
    return {
        persistSavedState: (savedState: ISavedState) => dispatch(persistSavedState(savedState)),
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(withRouter(Settings));