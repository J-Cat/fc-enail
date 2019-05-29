import * as React from 'react';
import uuid from  'uuid/v4';
import * as ProfilesProps from './container';
import './profiles.less';
import { IonContent, IonItemGroup, IonItem, IonSelect, IonSelectOption, IonLabel, IonItemDivider, IonInput, IonButton, IonAlert } from '@ionic/react';

export default class Profiles extends React.Component<ProfilesProps.IProps, ProfilesProps.IState> {
    constructor(props: ProfilesProps.IProps) {
        super(props);

        this.state = {
            p: this.props.p,
            i: this.props.i,
            d: this.props.d,
            start: {
                p: this.props.p,
                i: this.props.i,
                d: this.props.d,
                profile: this.props.profile
            },
            profile: this.props.profile,
            dirty: false,
            saveDialogOpen: false,
            deleteDialogOpen: false,
            tuning: this.props.tuning
        }
    }

    static getDerivedStateFromProps(nextProps: ProfilesProps.IProps, prevState: ProfilesProps.IState) {
        let newState = {};

        if (nextProps.p !== prevState.start.p) {
            newState = {
                ...newState,
                p: nextProps.p,
                start: {
                    ...prevState.start,
                    p: nextProps.p
                }
            };
        }
        if (nextProps.i !== prevState.start.i) {
            newState = {
                ...newState,
                i: nextProps.i,
                start: {
                    ...prevState.start,
                    i: nextProps.i
                }
            };
        }
        if (nextProps.d !== prevState.start.d) {
            newState = {
                ...newState,
                d: nextProps.d,
                start: {
                    ...prevState.start,
                    d: nextProps.d
                }            
            };
        }
        if (nextProps.profile !== prevState.start.profile) {
            newState = {
                ...newState,
                profile: nextProps.profile || '',
                start: {
                    ...prevState.start,
                    profile: nextProps.profile
                }            
            };
        }

        if (nextProps.tuning !== prevState.tuning) {
            if (!nextProps.tuning) {
                newState = {
                    tuning: nextProps.tuning,
                    profile: '',
                    dirtry: true
                };
            } else {
                newState = {
                    tuning: nextProps.tuning
                };
            }
        }

        if (newState === {}) {
            return null;
        } else {
            return newState;
        }
    }

    savePidSettings = (e: MouseEvent) => {
        e.preventDefault();

        this.setState({
            saveDialogOpen: true
        });
    }

    render() {
        return <React.Fragment>
            <IonContent>
                <IonItemGroup class="profiles">
                    <IonItemDivider><IonLabel>Current Profile</IonLabel></IonItemDivider>
                    <IonItem class="profiles-current">
                        <IonSelect value={this.state.profile}
                            style={this.props.profile !== this.state.profile 
                                ? {
                                    color: 'var(--ion-color-danger)'
                                } 
                                : {}
                            }
                            disabled={this.state.tuning}
                            onIonChange={event => {
                                const profile = this.props.profiles[event.detail.value];
                                if (!profile) {
                                    return;
                                }

                                this.setState({
                                    profile: profile.key,
                                    p: profile.p,
                                    i: profile.i,
                                    d: profile.d
                                });
                            }}
                        >
                            {this.props.profiles 
                                ? Object.keys(this.props.profiles).map((key) => {
                                    const profile = this.props.profiles[key];
                                    return <IonSelectOption key={profile.key} value={profile.key}>
                                        {profile.title}
                                    </IonSelectOption>
                                })
                                : ''
                            }
                        </IonSelect>
                    </IonItem>
                    <IonItemDivider><IonLabel>Profile Settings</IonLabel></IonItemDivider>
                    <IonItem>
                        <IonLabel slot="start">Proportional Band</IonLabel>
                        <IonInput 
                                type="number"
                                value={this.state.p.toString()}
                                required={true}
                                placeholder={`P`}
                                disabled={this.state.tuning}
                                onIonChange={event => {
                                    const value = parseInt(event.detail.value || '0');
                                    if (isNaN(value)) {
                                        return;
                                    }
                                    if (this.state.p !== value) {
                                        this.setState({
                                            p: value,
                                            dirty: true
                                        });
                                    }
                                }}
                            />
                    </IonItem>
                    <IonItem>
                        <IonLabel slot="start">Integral Time</IonLabel>
                        <IonInput 
                                type="number"
                                value={this.state.i.toString()}
                                required={true}
                                placeholder={`I`}
                                disabled={this.state.tuning}
                                onIonChange={event => {
                                    const value = parseInt(event.detail.value || '0');
                                    if (isNaN(value)) {
                                        return;
                                    }

                                    if (this.state.i !== value) {
                                        this.setState({
                                            i: value,
                                            dirty: true
                                        });
                                    }
                                }}
                            />
                    </IonItem>
                    <IonItem>
                        <IonLabel slot="start">Derivative Time</IonLabel>
                        <IonInput 
                                type="number"
                                value={this.state.d.toString()}
                                required={true}
                                placeholder={`D`}
                                disabled={this.state.tuning}
                                onIonChange={event => {
                                    const value = parseInt(event.detail.value || '0');
                                    if (isNaN(value)) {
                                        return;
                                    }

                                    if (this.state.d !== value) {
                                        this.setState({
                                            d: value,
                                            dirty: true
                                        });
                                    }
                                }}
                            />
                    </IonItem>
                </IonItemGroup>
                <IonItem class="profiles">
                    <div className="profiles-buttons">
                    <IonButton 
                        type="submit"
                        size="default"
                        disabled={this.state.tuning || (this.state.profile !== '' && (!this.state.dirty && (this.props.profile === this.state.profile)))}
                        onClick={this.savePidSettings}
                    >
                        Save
                    </IonButton>                
                    <IonButton 
                        type="button"
                        size="default"
                        disabled={this.state.tuning}
                        onClick={() => this.setState({deleteDialogOpen: true})}
                    >
                        Delete
                    </IonButton>                
                    <IonButton 
                        type="button"
                        size="default"
                        disabled={this.state.tuning}
                        onClick={() => this.setState({
                            profile: ''
                        })}
                    >
                        New
                    </IonButton>                
                    <IonButton 
                        type="button"
                        size="default"
                        disabled={this.state.tuning !== this.props.tuning}
                        onClick={() => {
                            this.setState({
                                tuning: !this.props.tuning
                            }, () => {
                                this.props.toggleTuning()
                            });
                        }}
                    >
                        {this.state.tuning ? 'Cancel Tuning' : 'Auto-Tune'}
                    </IonButton>                
                    </div>
                </IonItem>
            </IonContent>
            <IonAlert
                isOpen={this.state.saveDialogOpen}
                onDidDismiss={() => this.setState({ saveDialogOpen: false })}
                header={'Save Profile?'}
                message={'Please enter the profile title.'}
                inputs={[{
                    name: 'title',
                    type: 'text',
                    value: this.state.profile && this.props.profiles[this.state.profile]
                        ? this.props.profiles[this.state.profile].title 
                        : '',
                    placeholder: 'Profile Title'
                }]}
                buttons={[{
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: 'Ok',
                    handler: (value) => {
                        this.props.savePidSettings({
                            key: this.state.profile === '' ? uuid().toUpperCase() : this.state.profile,
                            title: value.title,
                            p: this.state.p,
                            i: this.state.i,
                            d: this.state.d
                        });
                    }
                }]}    
            />
            <IonAlert
                isOpen={this.state.deleteDialogOpen}
                onDidDismiss={() => this.setState({ deleteDialogOpen: false })}
                header={'Delete Profile?'}
                message={'Are you sure you want to delete this profile?'}
                buttons={[{
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: 'Ok',
                    handler: () => {
                        this.props.deleteProfile(this.state.profile);
                        this.setState({
                            start: {
                                p: this.state.p,
                                i: this.state.i,
                                d: this.state.d,
                                profile: this.props.profile
                            },
                            profile: this.props.profile,
                        });
                    }
                }]}
            />
        </React.Fragment>
   }
}