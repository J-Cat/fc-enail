/*
 * File: c:\fc-enail\fc-enail-client\src\routes\reconnect\reconnect.tsx
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
import * as React from 'react';

import * as ReconnectProps from './container';
import * as Constants from '../../models/constants';
import config from '../../config';

import './reconnect.less';
import { IonContent, IonLabel, IonHeader, IonText, IonGrid, IonRow, IonCol, IonInput, IonButton } from '@ionic/react';

export default class Reconnect extends React.Component<ReconnectProps.IProps, ReconnectProps.IState> {

    constructor(props: ReconnectProps.IProps) {
        super(props);

        this.state = {
            serviceUrl: localStorage.getItem(Constants.LOCAL_STORAGE_FCENAIL_SERVICE_URL) || config.serviceUrl
        };
    }

    submit = (e: React.FormEvent) => {
        e.preventDefault();
        this.props.connectManual(this.state.serviceUrl);
    }

    handleInputChange = (e: Event) => {
        if (e.target) {
            const input = e.target as HTMLInputElement;
            this.setState({
                serviceUrl: input.value
            });
        }
    }

    render() {
        return (
            <IonContent class="reconnect" scrollY={false}>
                <form onSubmit={this.submit}>
                    <IonLabel class="version-label">{this.props.version}</IonLabel>
                    <IonHeader class="reconnect-header">
                        <IonText>FC E-Nail</IonText>
                    </IonHeader>
                    <IonGrid class="reconnect-content">
                        <IonRow class="reconnect-content-datarow">
                            <IonCol>
                                <IonLabel 
                                    class="reconnect-content-datarow-label"
                                >
                                    Please enter the service URL.
                                </IonLabel>
                                <IonInput
                                    class="reconnect-content-datarow-input"
                                    type="url"
                                    autoCorrect="off"
                                    name="serviceUrl"
                                    placeholder="http://<IP Address>"
                                    onInput={this.handleInputChange}
                                    value={this.state.serviceUrl}
                                    required={true}
                                    autofocus={true}
                                />
                            </IonCol>
                        </IonRow>
                        <IonRow class="reconnect-content-buttonrow">
                            <IonCol>
                                <IonButton 
                                    type="submit"
                                >
                                    Submit
                                </IonButton>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </form>
            </IonContent>
        );
    }
}
