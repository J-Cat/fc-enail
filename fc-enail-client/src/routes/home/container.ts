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
import { setSP, toggleState, runScript, endScript } from '../../reducers/enailReducer';

export namespace HomeProps {
    export interface IStateProps {
        readonly version: string;
        readonly state?: IEnailEmitState;
        readonly scripts: IEnailScript[];
    }

    export interface IDispatchProps {
        setSP: (value: number) => void;
        toggleState: () => void;
        runScript: () => void;
        endScript: () => void;
    }

    export interface IOwnProps {
    }

    export interface IProps extends RouteComponentProps<any>, IStateProps, IDispatchProps, IOwnProps {
    }

    export interface IState {
        readonly changing: boolean;
        readonly sliderValue: number;
    }
}

function mapStateToProps(state: IEnailStore, ownProps: HomeProps.IOwnProps) {
    return {
        version: state.version.version,
        state: state.enail.emitState,
        scripts: state.enail.scripts || []
    };
}

function mapDispatchToProps(dispatch: (...args: any[]) => void) {
    return {
        setSP: (value: number) => dispatch(setSP(value)),
        toggleState: () => dispatch(toggleState()),
        runScript: () => dispatch(runScript()),
        endScript: () => dispatch(endScript()),
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(withRouter(Home));