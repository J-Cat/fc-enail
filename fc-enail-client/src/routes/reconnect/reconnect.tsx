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
import { Form, Input, Button } from 'antd';

import * as ReconnectProps from './container';
import * as Constants from '../../models/constants';
import config from '../../config';

import './reconnect.less';

const fcLogo = require('../../assets/fclogo.png');
const FormItem = Form.Item;

export class Reconnect extends React.Component<ReconnectProps.IProps, ReconnectProps.IState> {

    constructor(props: ReconnectProps.IProps) {
        super(props);
    }

    submit = (e: React.FormEvent) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
               this.props.connectManual(values.serviceUrl);
            }
        });
    }

    handleUrlChange = (value: string) => {
        this.setState({
            serviceUrl: value
        });
    }

    render() {
        const getFieldDecorator = this.props.form.getFieldDecorator;

        return (
            <div className="reconnect">
                <div className="version-label">{this.props.version}</div>
                <div className="reconnect-header">
                    <img src={fcLogo} alt="FC" className="reconnect-header-logo" />
                </div>
                <div className="reconnect-halfspacer" />
                <div className="reconnect-content">
                    <div className="reconnect-content-container">
                        <Form onSubmit={this.submit} >
                            <div className='reconnect-content-container-datarow'>
                                <div className='reconnect-content-container-datarow-spaer' />
                                <div className='reconnect-content-container-datarow-content'>
                                    <FormItem
                                        help='Please enter the service URL.'
                                    >
                                    {getFieldDecorator('serviceUrl', {
                                        rules: [{ required: true, message: 'Please enter a valid service URL!' }],
                                        initialValue: localStorage.getItem(Constants.LOCAL_STORAGE_FCENAIL_SERVICE_URL) || config.serviceUrl
                                      })(
                                        <Input
                                            placeholder='http://<IP Address>'
                                            inputMode="url"
                                            // tslint:disable-next-line:jsx-no-lambda
                                        />
                                      )}
                                    </FormItem>
                                </div>
                                <div className='reconnect-content-container-datarow-spaer' />
                            </div>
                            <FormItem className="reconnect-content-container-buttonrow">
                                <Button
                                    htmlType="submit"
                                >
                                    Connect
                                </Button>
                            </FormItem>
                        </Form>                    
                    </div>
                </div>
                <div className="reconnect-footer" />
            </div>
        );
    }
}

const ReconnectForm = Form.create()(Reconnect);

export default ReconnectForm as any;