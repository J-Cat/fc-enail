/*
 * File: c:\fc-enail\fc-enail-client\src\routes\home\home.tsx
 * Project: c:\fc-enail\fc-enail-client
 * Created Date: Sunday November 11th 2018
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
import './home.less';

import { HomeProps } from './container';
import { Slider, Modal, Toast, Switch } from 'antd-mobile';
import { Button } from 'antd';
import { Action } from 'antd-mobile/lib/modal/PropsType';

const MAX_TEMP = 1000;

export class Home extends React.Component<HomeProps.IProps, HomeProps.IState> {

    constructor(props: HomeProps.IProps) {
        super(props);

        this.state = {
            changing: false,
            sliderValue: this.props.state ? this.props.state.sp : 0
        };
    }

    onSetPointBeginChange = (value?: number) => {
        if (value) {
            this.setState({
                changing: true,
                sliderValue: value
            });
        }
    }

    onSetPointChange = (value?: number) => {
        if (value) {
            this.props.setSP(value);
            setTimeout((() => {
                this.setState({
                    changing: false,
                    sliderValue: value
                });
            }).bind(this), 500);
        } else {
            this.setState({
                changing: false
            });
        }

    }

    getSPDialog = () => {
        Modal.prompt('Set Point', 'Please enter the desired set point temperature.', [
          {
            text: 'Ok',
            onPress: (value: string) => {
                return new Promise<number>((resolve, reject) => {
                    Toast.info(`Setting temperature to ${value}`, 1);
                    setTimeout(() => {
                        const v = parseInt(value);
                        if (isNaN(v)) {
                            resolve(v);
                        } else {
                            reject();
                        }
                    }, 1000);
                })
            },
        },
        {
            text: 'Cancel',
            onPress: () => { 
                return new Promise<string>((resolve, reject) => {
                    Toast.info('Cancelled', 1);
                    setTimeout(() => {
                        reject();
                    }, 1000);
                })},
            },
        ] as Array<Action<string>>, 'default', this.props.state ? this.props.state.sp.toString() : '', ['input your name']);
    }

    toggleState = () => {
        this.props.toggleState();
    }

    runEndScript = () => {
        if (!this.props.state) {
            return;
        }

        if (this.props.state.scriptRunning) {
            this.props.endScript();
        } else {
            this.props.runScript();
        }
    }

    render() {
        return (
            <div className="home">
                <div className="version-label">{this.props.version}</div>
                <div className="home-header" />
                <div className="home-content">
                    {this.props.state
                    ? <div>
                        <div className="home-content-body">
                            <div className="home-content-body-left">
                                <div className="home-content-body-left-pv">{this.props.state.pv}</div>
                                <div className="home-content-body-left-sp" onDoubleClick={this.getSPDialog}>{this.state.changing ? this.state.sliderValue : this.props.state ? this.props.state.sp : '-'}</div>
                            </div>
                            <div className="home-content-body-right">
                                <div className='spacer' />
                                <Switch className="home-content-body-right-switch" onChange={this.toggleState} checked={this.props.state.running} disabled={this.props.state === undefined} color="rgb(17, 100, 17)" />
                                <Button className="home-content-body-right-button" onClick={this.runEndScript} icon={this.props.state.scriptRunning ? 'border' : 'caret-right'} style={{color: this.props.state.scriptRunning ? 'darkred' : 'unset' }} />
                                <div className='spacer' />
                            </div>
                        </div>
                        <div className="home-content-slider">
                            <Slider trackStyle={{ height: '20px' }} railStyle={{height: '20px' }} handleStyle={{top: '9px'}} onChange={this.onSetPointBeginChange} onAfterChange={this.onSetPointChange} defaultValue={this.props.state ? this.props.state.sp : 0} max={MAX_TEMP} min={0} />
                        </div>
                    </div> : "Loading ..."
                    }
                </div>
                <div className="home-footer" />
            </div>
        );
    }
}




