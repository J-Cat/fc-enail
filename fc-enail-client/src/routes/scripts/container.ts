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

import { IEnailStore } from '../../models/IEnailStore';
import { IEnailScript } from '../../models/IEnailScript';
import Scripts from './scripts';
import { saveScript, deleteScript, setScript } from '../../reducers/enailReducer';

export interface IStateProps {
    readonly version: string;
    readonly script?: IEnailScript;
}

export interface IDispatchProps {
    readonly saveScript: (script: IEnailScript) => void;
    readonly deleteScript: (title: string) => void;
    readonly push: (location: string) => void;
    readonly setScript: (index: number) => void;
}

export interface IOwnProps {
}

export interface IProps extends RouteComponentProps<any>, IStateProps, IDispatchProps, IOwnProps {
}

export interface IState {
    readonly script?: IEnailScript;
    readonly changed: boolean;
    readonly saved: boolean;
    readonly menuOpen: string[];
    readonly menuVisible: boolean;
    readonly confirmDeleteOpen: boolean;
    readonly saveDialogOpen: boolean;
    readonly addStepDialogOpen: boolean;
    readonly currentStep: string;
}

function mapStateToProps(state: IEnailStore, ownProps: IOwnProps) {
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
        deleteScript: (title: string) => dispatch(deleteScript(title)),
        setScript: (index: number) => dispatch(setScript(index))
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(withRouter(Scripts));