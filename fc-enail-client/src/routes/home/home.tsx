import * as React from 'react';
import './home.less';

import * as HomeProps from './container';
import { format } from 'date-fns';

import { IEnailScript } from '../../models/IEnailScript';
import { IonContent, IonLabel, IonHeader, IonGrid, IonRow, IonCol, IonToggle, IonBadge, IonSlides, IonSlide, IonItem, IonButton, IonIcon, IonSegment, IonSegmentButton, IonRange, IonText, IonAlert } from '@ionic/react';
import { RangeChangeEventDetail } from '@ionic/core';

const MAX_TEMP = 1000;

export class Home extends React.Component<HomeProps.IProps, HomeProps.IState> {
    constructor(props: HomeProps.IProps) {
        super(props);

        this.state = {
            changing: false,
            sliderValue: this.props.state ? this.props.state.sp : 0,
            startingValue: this.props.state ? this.props.state.sp : 0,
            setPoint: this.props.state ? this.props.state.sp : 0,
            running: this.props.state ? this.props.state.running : false,
            scriptRunning: this.props.state ? this.props.state.scriptRunning : false,
            currentScript: this.props.state ? this.props.state.currentScript || 0 : 0,
            scriptChanging: true,
            showSPDialog: false
        };

        this.scriptAfterChange = this.scriptAfterChange.bind(this);
        this.onSetPointBeginChange = this.onSetPointBeginChange.bind(this);
    }

    static getDerivedStateFromProps(nextProps: HomeProps.IProps, prevState: HomeProps.IState) {
        if (!nextProps.state) {
            return null;
        }

        if (prevState.setPoint === 0) {
            return {
                sliderValue: nextProps.state.sp,
                startingValue: nextProps.state.sp,
                setPoint: nextProps.state.sp,
                running: nextProps.state.running,
                scriptRunning: nextProps.state.scriptRunning,
                currentScript: nextProps.state.currentScript || prevState.currentScript
            };
        } else if (nextProps.state.sp !== prevState.setPoint && !prevState.changing) {
            return {
                setPoint: nextProps.state.sp,
                sliderValue: nextProps.state.sp
            };
        } else if (nextProps.state && nextProps.state.currentScript !== undefined && prevState.currentScript !== nextProps.state.currentScript && prevState.scriptChanging) {
            return {
                currentScript: nextProps.state.currentScript,
                scriptChanging: false
            };
        }

        return null;
    }

    private timeout?: number = undefined;

    onSetPointBeginChange = (event: CustomEvent<RangeChangeEventDetail>) => {
        const value = event.detail.value as number;
        this.setState({
            changing: true,
            sliderValue: value
        });

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.props.setSP(value);
            this.setState({
                changing: false,
                sliderValue: value,
                setPoint: value
            });
        }, 500) as any;
    }

    onSetPointChange = (value?: number) => {
        if (value) {
            this.props.setSP(value);
            setTimeout((() => {
                this.setState({
                    changing: false,
                    sliderValue: value,
                    setPoint: value
                });
            }).bind(this), 500);
        } else {
            this.setState({
                changing: false
            });
        }

    }

    toggleState = () => {
        this.setState({
            running: !this.state.running
        }, () => {
            this.props.toggleState();
        });
    }

    runEndScript = () => {
        if (!this.props.state) {
            return;
        }

        const isScriptRunning = this.state.scriptRunning;
        this.setState({
            scriptRunning: !isScriptRunning
        }, () => {
            if (isScriptRunning) {
                this.props.endScript();
            } else {
                this.props.runScript();
            }
        });
    }

    scriptAfterChange = () => {
        if (!this.slider && !this.state.scriptChanging) {
            return;
        }

        this.slider.getActiveIndex().then((index: number) => {
            if (this.state && this.state.currentScript !== (index)) {
                this.props.setScript(index);
            } else {
                this.setState({
                    scriptChanging: false
                });
            }
        });
    }

    setQuickTemp = (value: number) => {
        this.props.setSP(value);
        this.setState({
            sliderValue: value,
            setPoint: value
        });
    }

    renderScriptItem = (script: IEnailScript) => {
        return <IonItem>
            <IonLabel>{script.title}</IonLabel>
            <IonButton slot="end" onClick={this.runEndScript}>
                <IonIcon name={this.state.scriptRunning ? 'square' : 'play'} style={{
                    color: this.state.scriptRunning ? 'red' : 'unset'
                }} />
            </IonButton>
        </IonItem>;
    }

    slider: any;

    componentDidUpdate(prevProps: HomeProps.IProps, prevState: HomeProps.IState) {
        if (this.slider && !this.state.scriptChanging) {
            const p = this.slider.getActiveIndex();
            if (p !== undefined) {
                (p as Promise<number>).then(index => {
                    if (index !== this.state.currentScript) {
                        this.slider.swiper.slideTo(this.state.currentScript);
                    }
                });
            }
        }
    }

    render() {
        return (
            <IonContent class="home" scrollY={false}>
                <IonLabel class="version-label">{this.props.version}</IonLabel>
                <IonHeader class="home-header">
                    <IonText>FC E-Nail</IonText>
                </IonHeader>
                {this.props.state ?
                    <IonGrid class="home-content">
                        <IonRow>
                            <IonCol size="8" class="home-content-temp">
                                <IonRow>
                                    <IonLabel>{this.props.state.pv}</IonLabel>
                                </IonRow>
                                <IonRow onClick={() => {
                                    this.setState({
                                        showSPDialog: true
                                    });
                                }}>
                                    <IonLabel>{this.state.sliderValue}</IonLabel>
                                </IonRow>
                            </IonCol>
                            <IonCol size="4" class="home-content-switch">
                                <IonRow>
                                    <IonToggle onClick={this.toggleState} checked={this.state.running} disabled={this.props.state === undefined} />
                                </IonRow>
                                <IonRow>
                                    {this.props.state.tuning
                                        ? <IonBadge>TUNE</IonBadge>
                                        : ''
                                    }
                                    {this.props.state.running
                                        ? <IonBadge>{format((this.props.autoShutoff * 60000) - (Date.now() - this.props.state.runningSince), 'm:ss')}</IonBadge>
                                        : ''
                                    }
                                </IonRow>
                            </IonCol>
                        </IonRow>
                        <IonRow class="home-content-scripts">
                            <IonCol>
                                <IonSlides pager={true} {...this.state.currentScript}
                                    ref={(ref) => {
                                        this.slider = ref;
                                    }}
                                    options={{
                                        initialSlide: this.state.currentScript
                                    }}
                                    onIonSlideDidChange={this.scriptAfterChange}
                                    onIonSlideTouchStart={() => {
                                        this.setState({
                                            scriptChanging: true
                                        });
                                    }}
                                >
                                    {this.props.scripts.map(script => {
                                        return <IonSlide key={script.index}>
                                            {this.renderScriptItem(script)}
                                        </IonSlide>;
                                    })}
                                </IonSlides>
                            </IonCol>
                        </IonRow>
                        <IonRow class="home-content-presets">
                            <IonCol>
                                <IonSegment>
                                    {this.props.presets.map(preset => {
                                        // tslint:disable-next-line:jsx-no-lambda
                                        return <IonSegmentButton key={`preset-button-${preset}`} onClick={() => this.setQuickTemp(preset)} checked={this.state.setPoint === preset}>{preset}</IonSegmentButton>;
                                    })}
                                </IonSegment>
                            </IonCol>
                        </IonRow>
                        <IonRow class="home-content-slider">
                            <IonCol>
                                <IonRange
                                    onIonChange={this.onSetPointBeginChange}
                                    value={this.state.sliderValue}
                                    max={MAX_TEMP}
                                    min={0}
                                    step={5}
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                    : ''}
                <IonAlert
                    isOpen={this.state.showSPDialog}
                    onDidDismiss={() => this.setState(() => ({ showSPDialog: false }))}
                    header={'Change Set Point'}
                    message={'Please enter a new set point.'}
                    inputs={[{
                        name: 'setPoint',
                        type: 'number',
                        value: this.state.sliderValue,
                        placeholder: 'Set Point'
                    }]}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        }, {
                            text: 'Okay',
                            handler: (value) => {
                                this.props.setSP(value.setPoint);
                                setTimeout((() => {
                                    this.setState({
                                        changing: false,
                                        sliderValue: value.setPoint,
                                        setPoint: value.setPoint
                                    });
                                }).bind(this), 500);
                            }
                        }
                    ]}
                />
            </IonContent>
        );
    }
}