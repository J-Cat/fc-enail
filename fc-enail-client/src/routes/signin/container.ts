/*
 * File: c:\fc-enail\fc-enail-client\src\routes\signin\container.ts
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
import SignIn from './signin';
import { verifyPassphrase } from '../../reducers/enailReducer';

export interface IStateProps {
    readonly version: string;
    readonly tokenError: boolean;
    readonly ready: boolean;
}

export interface IDispatchProps {
    verifyPassphrase: (passphrase: string) => void;
}

export interface IOwnProps {
}

export interface IProps extends RouteComponentProps<{}>, IStateProps, IDispatchProps, IOwnProps {
}

export interface IState {
    passphrase: string;
}

function mapStateToProps(state: IEnailStore, ownProps: IOwnProps) {
    return {
        version: state.version.version,
        tokenError: state.enail.tokenError,
        ready: !state.enail.requesting // && state.enail.connected
    };
}

function mapDispatchToProps(dispatch: (...args: any[]) => void) {
    return {
        verifyPassphrase: (passphrase: string) => dispatch(verifyPassphrase(passphrase))
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(withRouter(SignIn));