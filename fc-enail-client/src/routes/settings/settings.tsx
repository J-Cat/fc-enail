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
            presets: {},
            p: this.props.p,
            i: this.props.i,
            d: this.props.d,
            start: {
                p: this.props.p,
                i: this.props.i,
                d: this.props.d
            }
        };
    }

    static getDerivedStateFromProps(nextProps: SettingsProps.IProps, prevState: SettingsProps.IState) {
        let newState = {};

        if (nextProps.p !== prevState.start.p) {
            newState = {
                ...newState,
                p: nextProps.p
            };
        }
        if (nextProps.i !== prevState.start.i) {
            newState = {
                ...newState,
                i: nextProps.i
            };
        }
        if (nextProps.d !== prevState.start.d) {
            newState = {
                ...newState,
                d: nextProps.d
            };
        }

        if (newState === {}) {
            return null;
        } else {
            return newState;
        }
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

    savePidSettings = (e: React.FormEvent) => {
        e.preventDefault();
        this.props.savePidSettings({
            p: this.state.p,
            i: this.state.i,
            d: this.state.d
        });
        // this.props.
    }

    autoTune = (e: React.FormEvent) => {
        e.preventDefault();
        this.props.toggleTuning();
    }

    handlePidValueChange = (type: 'P'|'I'|'D', value: number) => {
        switch (type) {
            case 'P': {
                this.setState({ p: value });
                break;
            }
            case 'I': {
                this.setState({ i: value });
                break;
            }
            case 'D': {
                this.setState({ d: value });
                break;
            }
        }
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
                        <Form className="settings-content-container-presets" onSubmit={this.saveSettings}>
                            <div className='settings-content-container-presets-datarow'>
                                <div className='settings-content-container-presets-datarow-spacer' />
                                <div className='settings-content-container-presets-datarow-content'>
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
                                <div className='settings-content-container-presets-datarow-spacer' />
                            </div>
                            <FormItem className="settings-content-container-presets-buttonrow">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    disabled={!this.isValid()}
                                >
                                    Save
                                </Button>
                            </FormItem>
                        </Form>                    
                        <Form className="settings-content-container-pid" onSubmit={this.savePidSettings}>
                            <div className='settings-content-container-pid-datarow'>
                                <div className='settings-content-container-pid-datarow-spacer' />
                                <div className='settings-content-container-pid-datarow-content'>
                                    <FormItem
                                        label={`Propertional Band`}
                                    >
                                        <InputNumber
                                            min={0.1}
                                            max={999.9}
                                            defaultValue={this.props.p}
                                            value={this.state.p}
                                            // tslint:disable-next-line:jsx-no-lambda
                                            onChange={(value) => { this.handlePidValueChange('P', value as number); }}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label={`Integral Time`}
                                    >
                                        <InputNumber
                                            min={0}
                                            max={9999}
                                            defaultValue={this.props.i}
                                            value={this.state.i}
                                            // tslint:disable-next-line:jsx-no-lambda
                                            onChange={(value) => { this.handlePidValueChange('I', value as number); }}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label={`Derivative Time`}
                                    >
                                        <InputNumber
                                            min={0}
                                            max={9999}
                                            defaultValue={this.props.d}
                                            value={this.state.d}
                                            // tslint:disable-next-line:jsx-no-lambda
                                            onChange={(value) => { this.handlePidValueChange('D', value as number); }}
                                        />
                                    </FormItem>
                                </div>
                                <div className='settings-content-container-pid-datarow-spacer' />
                            </div>
                            <FormItem className="settings-content-container-pid-buttonrow">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    disabled={
                                        ((this.state.p === this.state.start.p) && (this.state.i === this.state.start.i) && (this.state.d === this.state.start.d))
                                        || this.props.state.tuning
                                    }
                                >
                                    Save
                                </Button>
                                &nbsp;&nbsp;
                                <Button
                                    type="primary"
                                    htmlType="button"
                                    onClick={this.autoTune}
                                    disabled={!this.props.state.running}
                                >
                                    {this.props.state.tuning ? 'Cancel Tuning' : 'Auto-Tune'}
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