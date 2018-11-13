/*
 * File: c:\fc-enail\fc-enail-client\src\routes\settings\settings.tsx
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
import { Form, InputNumber, Button } from 'antd';

const FormItem = Form.Item;

import './settings.less';

import { SettingsProps } from './container';

const fcLogo = require('../../assets/fclogo.png');
const MIN_PRESET = 0;
const MAX_PRESET = 1000;

export class Settings extends React.Component<SettingsProps.IProps, SettingsProps.IState> {

    constructor(props: SettingsProps.IProps) {
        super(props);

        this.state = {
            presets: {}
        };
    }

    handlePresetChange = (index: number, value: number | string) => {
        if (typeof(value) === 'number') {
            this.setState({
                presets: {
                    ...this.state.presets,
                    [index]: {
                        value,
                        validationStatus: 'success',
                        errorMsg: ''
                    }
                }
            });
        } else {
            this.setState({
                presets: {
                    ...this.state.presets,
                    [index]: {
                        value: this.props.presets[index],
                        validationStatus: 'error',
                        errorMsg: `${value} is not a valid number.`
                    }
                }
            });
        }
    }

    isValid = (): boolean => {
        for (const index of Object.keys(this.props.presets)) {
            if (this.state.presets[index] && this.state.presets[index].validationStatus !== 'success') {
                return false;
            }
        }
        return true;
    }

    saveSettings = (e: React.FormEvent) => {
        const presets = this.props.presets.map((value, index) => (
            this.state.presets[index] ? this.state.presets[index].value : value
        ));
        this.props.persistSavedState({ 
            presets
        });
    }

    render() {
        return (
            <div className="settings">
                <div className="version-label">{this.props.version}</div>
                <div className="settings-header">
                    <img src={fcLogo} alt="FC" className="settings-header-logo" />
                </div>
                <div className="settings-halfspacer" />
                <div className="settings-content">
                    {this.props.state
                    ? <div className="settings-content-container">
                        <Form onSubmit={this.saveSettings}>
                            <div className='settings-content-container-datarow'>
                                <div className='settings-content-container-datarow-spaer' />
                                <div className='settings-content-container-datarow-content'>
                                    {this.props.presets.map((preset, index) => {
                                        return (
                                            <FormItem
                                                key={`preset_${index}`}
                                                label={`Preset #${index+1}`}
                                                validateStatus={this.state.presets[index] ? this.state.presets[index].validationStatus : 'success'}
                                                help={this.state.presets[index] ? this.state.presets[index].errorMsg : ''}
                                            >
                                                <InputNumber
                                                    min={MIN_PRESET}
                                                    max={MAX_PRESET}
                                                    defaultValue={preset}
                                                    // tslint:disable-next-line:jsx-no-lambda
                                                    onChange={(value) => this.handlePresetChange(index, value as string|number)}
                                                />
                                            </FormItem>
                                        );
                                    })}
                                </div>
                                <div className='settings-content-container-datarow-spaer' />
                            </div>
                            <FormItem className="settings-content-container-buttonrow">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    disabled={!this.isValid()}
                                >
                                    Save
                                </Button>
                            </FormItem>
                        </Form>                    
                    </div> : "Loading ..."}
                </div>
                <div className="settings-footer" />
            </div>
        );
    }
}

const SettingsForm = Form.create()(Settings);

export default SettingsForm;