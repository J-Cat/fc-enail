import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { IonLabel, IonHeader, IonToolbar, IonTitle, IonIcon, IonButtons, IonButton, IonPopover, IonList, IonItem } from '@ionic/react';
import * as SettingsProps from './container';
import { GeneralSettings } from './general';
import { Profiles } from './profiles';
import './settings.less';

const MIN_PRESET = 0;
const MAX_PRESET = 1000;

export default class Settings extends React.Component<SettingsProps.IProps, SettingsProps.IState> {
    constructor(props: SettingsProps.IProps) {
        super(props);

        this.state = {
            menuVisible: false
        };
    }

    render() {
        return (
            <React.Fragment>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => {
                            this.setState({menuVisible: true});
                        }}>
                            <IonIcon slot="icon-only" name="menu" />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>{this.props.location.pathname.indexOf('profiles') >= 0 ? 'Profiles' : 'Settings'}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <Switch>
                <Route path="/settings/profiles" component={Profiles} />
                <Route path="/settings" component={GeneralSettings} />
            </Switch>
            <IonPopover
                isOpen={this.state.menuVisible}
                onDidDismiss={() => this.setState({ menuVisible: false })}
            >
                <IonList>
                    <IonItem onClick={(event) => {
                        event.preventDefault();
                        this.props.history.push('/settings');
                        this.setState({
                            menuVisible: false
                        });
                    }}>
                        <IonIcon name="settings" slot="start" />
                        <IonLabel>Settings</IonLabel>
                    </IonItem>
                    <IonItem onClick={(event) => {
                        event.preventDefault();
                        this.props.history.push('/settings/profiles');
                        this.setState({
                            menuVisible: false
                        });
                    }}>
                        <IonIcon name="options" slot="start" />
                        <IonLabel>Profiles</IonLabel>
                    </IonItem>
                </IonList>
            </IonPopover>                
            </React.Fragment>
        );
    }
}