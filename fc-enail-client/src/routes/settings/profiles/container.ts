import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { IEnailStore } from '../../../models/IEnailStore';
import Profiles from './profiles';
import { IEnailEmitState } from '../../../models/IEnailEmitState';
import { ISavedState } from '../../../models/ISavedState';
import { persistSavedState, toggleTuning, savePidSettings, deleteProfile } from '../../../reducers/enailReducer';
import { IPidSettings } from '../../../models/IPidSettings';

export interface IStateProps {
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
    readonly profiles: {
        [profile: string]: IPidSettings;
    };
    readonly tuning: boolean;
}

export interface IDispatchProps {
    toggleTuning: () => void;
    savePidSettings: (settings: IPidSettings) => void;
    deleteProfile: (profile: string) => void;
}

export interface IOwnProps {
}

export interface IProps extends RouteComponentProps<any>, IStateProps, IDispatchProps, IOwnProps {
}

export interface IState {
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
    readonly dirty: boolean;
    readonly saveDialogOpen: boolean;
    readonly deleteDialogOpen: boolean;
    readonly tuning: boolean;
}

function mapStateToProps(state: IEnailStore, ownProps: IOwnProps) {
    return {
        p: state.enail.emitState ? state.enail.emitState.p : 0,
        i: state.enail.emitState ? state.enail.emitState.i : 0,
        d: state.enail.emitState ? state.enail.emitState.d : 0,
        profile: state.enail.emitState ? state.enail.emitState.profile || '' : state.enail.profiles.currentProfile || '',
        profiles: state.enail.profiles.profiles,
        tuning: state.enail.emitState ? state.enail.emitState.tuning : false
    };
}

function mapDispatchToProps(dispatch: (...args: any[]) => void) {
    return {
        toggleTuning: () => dispatch(toggleTuning()),
        savePidSettings: (settings: IPidSettings) => dispatch(savePidSettings(settings)),
        deleteProfile: (profile: string) => dispatch(deleteProfile(profile))
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(withRouter(Profiles));