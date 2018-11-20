/*
 * File: c:\fc-enail\fc-enail-client\src\routes\scripts\container.ts
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
import { IEnailScript } from '../../models/IEnailScript';
import Scripts from './scripts';
import { saveScript, deleteScript } from '../../reducers/enailReducer';

export namespace ScriptsProps {
    export interface IStateProps {
        readonly version: string;
        readonly script?: IEnailScript;
    }

    export interface IDispatchProps {
        readonly saveScript: (script: IEnailScript) => void;
        readonly deleteScript: (title: string) => void;
    }

    export interface IOwnProps {
    }

    export interface IProps extends RouteComponentProps<any>, FormComponentProps, IStateProps, IDispatchProps, IOwnProps {
    }

    export interface IState {
        readonly script: IEnailScript;
        readonly changed: boolean;
        readonly saved: boolean;
    }
}

function mapStateToProps(state: IEnailStore, ownProps: ScriptsProps.IOwnProps) {
    const script = state.enail.emitState && state.enail.scripts && (state.enail.emitState.currentScript !== undefined)
        ? state.enail.scripts[state.enail.emitState.currentScript] : undefined;
    return {
        version: state.version.version,
        script
    };
}

function mapDispatchToProps(dispatch: (...args: any)=> void) {
    return {
        saveScript: (script: IEnailScript) => dispatch(saveScript(script)),
        deleteScript: (title: string) => dispatch(deleteScript(title))
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(withRouter(Scripts));