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
import { Badge, Grid, Slider, Modal, Toast, Switch } from 'antd-mobile';
import { Button } from 'antd';
import { Action } from 'antd-mobile/lib/modal/PropsType';

import { IEnailScript } from '../../models/IEnailScript';

const fcLogo = require('../../assets/fclogo.png');

const MAX_TEMP = 1000;

export class Home extends React.Component<HomeProps.IProps, HomeProps.IState> {
    constructor(props: HomeProps.IProps) {
        super(props);

        this.state = {
            changing: false,
            sliderValue: this.props.state ? this.props.state.sp : 0,
            startingValue: this.props.state ? this.props.state.sp : 0
        };
    }

    static getDerivedStateFromProps(nextProps: HomeProps.IProps, prevState: HomeProps.IState) {
        if (nextProps.state && (nextProps.state.sp !== prevState.sliderValue) && (!prevState.changing)
            && (prevState.startingValue !== nextProps.state.sp)) {
            return {
                sliderValue: nextProps.state.sp,
                startingValue: nextProps.state.sp
            };
        }
        return null;
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
        const modal = Modal.prompt('Set Point', 'Please enter the desired set point temperature.', [{
            text: 'Ok',
            onPress: (value: string) => {
                return new Promise<number>((resolve, reject) => {
                    Toast.info(`Setting temperature to ${value}`, 1);
                    setTimeout(() => {
                        const v = parseFloat(value);
                        if (!isNaN(v)) {
                            this.props.setSP(v);
                            resolve(v);
                        } else {
                            reject();
                        }
                        modal.close();
                    }, 1000);
                })
            },
        }, {
            text: 'Cancel',
            onPress: () => { 
                return new Promise<string>((resolve, reject) => {
                    Toast.info('Cancelled', 1);
                    setTimeout(() => {
                        reject();
                        modal.close();
                    }, 1000);
                })},
            },
        ] as Array<Action<string>>, 
        'default', 
        this.props.state ? this.props.state.sp.toString() : '', ['input your name']);
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

    scriptAfterChange = (to: number) => {
        this.props.setScript(to);
        return;
    }

    setQuickTemp = (value: number) => {
        this.props.setSP(value);
        this.setState({
            sliderValue: value
        });
    }

    renderScriptItem = (script: IEnailScript) => {
        return (<div className="home-content-body2-scripts-item">
            <div className="home-content-body2-scripts-item-spacer" />
            <div className="home-content-body2-scripts-item-content">
                <div className="home-content-body2-scripts-item-content-left">
                    {script.title}
                </div>
                <div className="home-content-body2-scripts-item-content-right">
                    <Button className="home-content-body2-scripts-item-content-right-button" onClick={this.runEndScript} icon={this.props.state!.scriptRunning ? 'pause-circle' : 'play-circle'} style={{color: this.props.state!.scriptRunning ? '#A00000' : 'black' }} />
                </div>
            </div>
            <div className="home-content-body2-scripts-item-spacer" />
        </div>);
    }

    render() {
        const gridProps = {
            data: this.props.scripts,
            isCarousel: true,
            columnNum: 1,
            carouselMaxRow: 1,
            afterChange: this.scriptAfterChange,
            className: 'home-content-body2-scripts',
            renderItem: this.renderScriptItem,
            selectedIndex: this.props.state ? this.props.state.currentScript || 0 : 0
        };

        return (
            <div className="home">
                <div className="version-label">{this.props.version}</div>
                <div className="home-header">
                    <img src={fcLogo} alt="FC" className="home-header-logo" />
                </div>
                <div className="home-halfspacer" />
                <div className="home-content">
                    {this.props.state
                    ? <div className="home-content-container">
                        <div className="home-content-container-body1body2">
                            <div className="home-content-body1">
                                <div className="home-content-body1-left">
                                    <div className="home-content-body1-left-pv">{this.props.state.pv}</div>
                                    <div className="home-content-body1-left-sp" onClick={this.getSPDialog}>{this.state.changing ? this.state.sliderValue : this.props.state ? this.props.state.sp : '-'}</div>
                                </div>
                                <div className="home-content-body1-right">
                                    <div className='home-content-body1-right-spacer' />
                                    <Switch className="home-content-body1-right-switch" onChange={this.toggleState} checked={this.props.state.running} disabled={this.props.state === undefined} color="#A00000"  />
                                    {this.props.state.tuning
                                        ? <Badge text="TUNE" className="home-content-body1-right-badge" />
                                        : ''
                                    }
                                    <div className='home-content-body1-right-spacer' />
                                </div>
                            </div>
                            <div className="home-content-body2">
                                <Grid {...gridProps} />                
                            </div>
                        </div>
                        <div className="home-content-body3">
                            <div className="home-content-body3-spacer" />
                            <div className="home-content-body3-content">
                                {this.props.presets.map((preset, index) => {
                                    return (
                                        <Button 
                                            key={`preset_button_${index}`} 
                                            className={preset === this.props.state!.sp ? "home-content-body3-content-quicktemp-selected" : "home-content-body3-content-quicktemp"}
                                            // tslint:disable-next-line:jsx-no-lambda
                                            onClick={() => this.setQuickTemp(preset)}
                                        >
                                            {preset}
                                        </Button>
                                    );
                                })}
                            </div>
                            <div className="home-content-body3-spacer" />
                        </div>
                        <div className="home-content-body4">
                            <div className="home-content-body4-spacer" />
                            <div className="home-content-body4-slider">
                                <Slider trackStyle={{ height: '20px' }} railStyle={{height: '20px' }} handleStyle={{top: '9px'}} onChange={this.onSetPointBeginChange} onAfterChange={this.onSetPointChange} value={this.state.sliderValue} max={MAX_TEMP} min={0} />
                            </div>
                            <div className="home-content-body4-spacer" />
                        </div>
                    </div> : "Loading ..."
                    }
                </div>
                <div className="home-footer" />
            </div>
        );
    }
}




