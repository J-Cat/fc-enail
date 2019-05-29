/*
 * File: c:\fc-enail\fc-enail-client\src\routes\signin\signin.tsx
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
import * as SignInProps from './container';
import './signin.less';
import { IonContent, IonLabel, IonHeader, IonText, IonGrid, IonRow, IonInput, IonButton, IonItem, IonCol } from '@ionic/react';

export default class SignIn extends React.Component<SignInProps.IProps, SignInProps.IState> {

    constructor(props: SignInProps.IProps) {
        super(props);

        this.state = {
            passphrase: ''
        };
    }

    submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!this.props.ready) {
            return;
        }
        this.props.verifyPassphrase(this.state.passphrase);
    }

    handleInputChange = (e: Event) => {
        if (e.target) {
            const input = e.target as HTMLInputElement;
            this.setState({
                passphrase: input.value
            });
        }
    }

    render() {
        return (
            <IonContent class="signin" scrollY={false}>
                <form onSubmit={this.submit}>
                    <IonLabel class="version-label">{this.props.version}</IonLabel>
                    <IonHeader class="signin-header">
                        <IonText>FC E-Nail</IonText>
                    </IonHeader>
                    <IonGrid class="signin-content">
                        <IonRow class="signin-content-datarow">
                            <IonCol>
                                <IonLabel 
                                    class="signin-content-datarow-label"
                                    color={this.props.tokenError?'danger':''}
                                >
                                    {this.props.tokenError
                                        ? 'Failed to verify the token.  Please try again.'
                                        : 'Please enter the passphrase from the E-Nail.'
                                    }
                                </IonLabel>
                                <IonInput
                                    class="signin-content-datarow-input"
                                    type="text"
                                    autoCorrect="off"
                                    name="passphrase"
                                    placeholder="passphrase"
                                    onInput={this.handleInputChange}
                                    required={true}
                                    title="Passphrase did not match that on the e-nail."
                                    autofocus={true}
                                />
                            </IonCol>
                        </IonRow>
                        <IonRow class="signin-content-buttonrow">
                            <IonCol>
                                <IonButton 
                                    type="submit"
                                    disabled={!this.props.ready}
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
