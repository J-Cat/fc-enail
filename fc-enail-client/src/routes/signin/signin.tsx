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
import { Form, Input, Button } from 'antd';

const FormItem = Form.Item;

import './signin.less';

import { SignInProps } from './container';

const fcLogo = require('../../assets/fclogo.png');

export class SignIn extends React.Component<SignInProps.IProps, SignInProps.IState> {

    constructor(props: SignInProps.IProps) {
        super(props);
    }

    submit = (e: React.FormEvent) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
               this.props.verifyPassphrase(values.passphrase);
            }
        });
    }

    render() {
        const getFieldDecorator = this.props.form.getFieldDecorator;

        return (
            <div className="signin">
                <div className="version-label">{this.props.version}</div>
                <div className="signin-header">
                    <img src={fcLogo} alt="FC" className="signin-header-logo" />
                </div>
                <div className="signin-halfspacer" />
                <div className="signin-content">
                    <div className="signin-content-container">
                        <Form onSubmit={this.submit} >
                            <div className='signin-content-container-datarow'>
                                <div className='signin-content-container-datarow-spaer' />
                                <div className='signin-content-container-datarow-content'>
                                    <FormItem
                                        help='Please enter the passphrase from the E-Nail.'
                                    >
                                    {getFieldDecorator('passphrase', {
                                        rules: [{ required: true, message: 'Please enter a passphrase!' }]
                                      })(
                                        <Input
                                            placeholder='passphrase'
                                            // tslint:disable-next-line:jsx-no-lambda
                                        />
                                      )}
                                    </FormItem>
                                </div>
                                <div className='signin-content-container-datarow-spaer' />
                            </div>
                            <FormItem className="signin-content-container-buttonrow">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                >
                                    Verify
                                </Button>
                            </FormItem>
                        </Form>                    
                    </div>
                </div>
                <div className="signin-footer" />
            </div>
        );
    }
}

const SignInForm = Form.create()(SignIn);

export default SignInForm;