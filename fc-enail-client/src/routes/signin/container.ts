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
import { FormComponentProps } from 'antd/lib/form';

import { IEnailStore } from '../../models/IEnailStore';
import SignIn from './signin';
import { verifyPassphrase } from '../../reducers/enailReducer';

export interface IStateProps {
    readonly version: string;
}

export interface IDispatchProps {
    verifyPassphrase: (passphrase: string) => void;
}

export interface IOwnProps {
}

export interface IProps extends RouteComponentProps<any>, FormComponentProps, IStateProps, IDispatchProps, IOwnProps {
}

export interface IState {
}

function mapStateToProps(state: IEnailStore, ownProps: IOwnProps) {
    return {
        version: state.version.version
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