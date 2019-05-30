import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { IEnailStore } from './models/IEnailStore';
import { App } from './App';

export interface IStateProps {
    readonly theme: string;
}

export interface IDispatchProps {
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
        theme: state.enail.theme
    };
}

function mapDispatchToProps(dispatch: (...args: any[]) => void) {
    return {
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(withRouter(App));