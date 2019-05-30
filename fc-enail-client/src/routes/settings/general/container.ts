import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { IEnailStore } from '../../../models/IEnailStore';
import GeneralSettings from './general';
import { IEnailEmitState } from '../../../models/IEnailEmitState';
import { ISavedState } from '../../../models/ISavedState';
import { persistSavedState, setTheme } from '../../../reducers/enailReducer';

export interface IStateProps {
    readonly version: string;
    readonly state?: IEnailEmitState;
    readonly presets: number[];
    readonly autoShutoff: number;
    readonly theme: string;
}

export interface IDispatchProps {
    persistSavedState: (savedState: ISavedState) => void;
    setTheme: (theme: string) => void;
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
    readonly dirty: boolean;
}

function mapStateToProps(state: IEnailStore, ownProps: IOwnProps) {
    return {
        version: state.version.version,
        state: state.enail.emitState,
        presets: state.enail.presets,
        autoShutoff: state.enail.autoShutoff,
        theme: state.enail.theme
    };
}

function mapDispatchToProps(dispatch: (...args: any[]) => void) {
    return {
        persistSavedState: (savedState: ISavedState) => dispatch(persistSavedState(savedState)),
        setTheme: (theme: string) => dispatch(setTheme(theme))
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(withRouter(GeneralSettings));