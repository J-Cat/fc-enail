import * as React from 'react';
import * as GeneralSettingsProps from './container';
import './general.less';
import { IonContent, IonItemGroup, IonItem, IonLabel, IonText, IonInput, IonItemDivider, IonButton } from '@ionic/react';

export default class GeneralSettings extends React.Component<GeneralSettingsProps.IProps, GeneralSettingsProps.IState> {
    constructor(props: GeneralSettingsProps.IProps) {
        super(props);

        this.state = {
            presets: {},
            autoShutoff: this.props.autoShutoff,
            dirty: false
        };
    }

    static getDerivedStateFromProps(nextProps: GeneralSettingsProps.IProps, prevState: GeneralSettingsProps.IState) {
        if (nextProps.autoShutoff !== prevState.autoShutoff && !prevState.dirty) {
            return {
                autoShutoff: nextProps.autoShutoff
            };
        }
        return null;
    }

    submit = (e: MouseEvent) => {
        e.preventDefault();
        this.props.persistSavedState({
            presets: this.props.presets.map((value, index) => (
                this.state.presets[index]
                    ? this.state.presets[index].value
                    : value
            )),
            autoShutoff: this.state.autoShutoff
        });
        setTimeout((() => {
            this.setState({
                dirty: false
            }, () => {
                this.props.history.push('/home');
            });    
        }).bind(this), 500);
    }

    render() {
        return <IonContent>
            <IonItemGroup class="settings">
                <IonItemDivider>
                    <IonLabel>Presets</IonLabel>
                </IonItemDivider>
                {this.props.presets.map((preset, index) => {
                    return <IonItem>
                        <IonLabel position="fixed">Preset #{index+1}</IonLabel>
                        <IonInput 
                            type="number"
                            value={this.state.presets[index] !== undefined
                                ? this.state.presets[index].value === 0
                                    ? ''
                                    : this.state.presets[index].value.toString() 
                                : preset.toString()}
                            required={true}
                            placeholder={`Preset #${index+1}`}
                            onIonChange={event => {
                                const value = parseInt(event.detail.value || '0');
                                if (isNaN(value)) {
                                    return;
                                }

                                this.setState({
                                    presets: {
                                        ...this.state.presets,
                                        [index]: {
                                            value,
                                            validationStatus: 'success',
                                            errorMsg: ''
                                        }
                                    },
                                    dirty: true
                                });
                            }}
                        />
                    </IonItem>;
                })}
                <IonItemDivider>
                    <IonLabel>Auto Shutoff</IonLabel>
                </IonItemDivider>
                <IonItem>
                    <IonLabel position="fixed"># of Minutes</IonLabel>
                    <IonInput 
                        type="number"
                        value={this.state.autoShutoff === 0 ? '' : this.state.autoShutoff.toString()}
                        required={true}
                        placeholder={`minutes`}
                        onIonChange={event => {
                            const value = parseInt(event.detail.value || '0');
                            if (isNaN(value)) {
                                return;
                            }

                            this.setState({
                                autoShutoff: value,
                                dirty: true
                            });
                        }}
                    />
                </IonItem>
            </IonItemGroup>
            <IonItem class="settings">
                <IonButton 
                    type="submit"
                    size="default"
                    disabled={!this.state.dirty}
                    onClick={this.submit}
                >
                    Save
                </IonButton>                
            </IonItem>
        </IonContent>
    }
}