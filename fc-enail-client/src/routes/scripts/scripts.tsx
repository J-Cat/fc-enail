import * as React from 'react';
import { IonContent, IonReorderGroup, IonReorder, IonLabel, IonItem, IonButton, IonIcon, IonItemGroup, IonItemSliding, IonItemOptions, IonItemOption, IonInput, IonText, IonSelect, IonSelectOption, IonHeader, IonToolbar, IonButtons, IonPopover, IonList, IonTitle, IonAlert } from '@ionic/react';
import { ItemReorderEventDetail } from '@ionic/core';
import * as ScriptsProps from './container';
import { Step } from '../../models/Step';
import { IStep } from '../../models/IStep';
import { IEnailScript } from '../../models/IEnailScript';
import { remapScript } from '../../helpers/stepHelper';
import { ILoopStep } from '../../models/ILoopStep';
import { IMoveTempStep } from '../../models/IMoveTempStep';
import { IFeedbackStep } from '../../models/IFeedbackStep';
import { IWaitTempStep, Direction } from '../../models/IWatiTempStep';
import { ITimerStep } from '../../models/ITimerStep';
import * as Constants from '../../models/constants';
// import config from '../../config';

import './scripts.less';

export default class Scripts extends React.Component<ScriptsProps.IProps, ScriptsProps.IState> {
    constructor(props: ScriptsProps.IProps) {
        super(props);
        this.state = {
            script: this.props.script 
                ? {...this.props.script}
                : undefined,
            changed: false,
            saved: false,
            menuOpen: [],
            menuVisible: false,
            confirmDeleteOpen: false,
            saveDialogOpen: false,
            addStepDialogOpen: false,
            currentStep: ''
        };

        this.deleteScript = this.deleteScript.bind(this);
    }

    static getDerivedStateFromProps(nextProps: ScriptsProps.IProps, prevState: ScriptsProps.IState) {
        if ((!prevState.script && nextProps.script)
            || (prevState.script && nextProps.script && prevState.script.title !== nextProps.script.title && prevState.script.title !== '')
         ) {
            return {
                script: {...nextProps.script},
                menuOpen: []
            };
        }
        return null;
    }

    createNew = (e: MouseEvent) => {
        e.preventDefault();

        const script = {
            title: '',
            step: remapScript({
                type: Constants.STEP_SEQUENTIAL,
                steps: []
            })
        } as IEnailScript;

        this.setState({
            menuVisible: false,
            script
        });
    }

    submit = (e: React.FormEvent) => {
        e.preventDefault();
    }

    deleteScript = (e: MouseEvent) => {
        e.preventDefault();

        this.setState({
            confirmDeleteOpen: this.state.script ? true : false
        });
    }

    saveScript = (e: MouseEvent) => {
        e.preventDefault();

        this.setState({
            saveDialogOpen: this.state.script ? true : false
        });
    }

    addStepStart = (step: IStep) => {
        this.setState({
            menuVisible: false,
            addStepDialogOpen: true,
            currentStep: step.key!
        });
    }

    addStepComplete = (type: string) => {
        const step = this.getNewStep(type);
        this.setState({
            script: {
                ...this.state.script!,
                step: this.addStep(this.state.currentStep, this.state.script!.step, step as IStep)
            }
        });
    }

    addStep = (key: string, step: IStep, newStep: IStep): IStep => {
        return {
            ...step,
            steps: step.key! === key 
                ? [...step.steps!, {
                    ...newStep,
                    key: `${step.key!}${step.key! !== '' ? '.' : ''}${step.steps!.length}`
                }]
                : step.steps!.map(s => {
                    return this.addStep(key, s, newStep)
                })
        };
    }

    deleteStep = (key: string, step: IStep): IStep => {
        return {
            ...step,
            steps: step.steps!.filter(s => s.key! !== key).map((s, index) => {
                return this.deleteStep(key, s)
            })
        }
    }

    reorder = (key: string, event: CustomEvent<ItemReorderEventDetail>) => {
        if (this.state.script && this.state.script.step.steps) {
            const newScript = {
                ...this.state.script,
                step: this.reorderStep(this.state.script!.step, key, event.detail.from, event.detail.to)
            }
            this.setState({
                script: newScript
            });
        }
        event.stopPropagation();
        event.detail.complete();
    }

    reorderStep = (step: IStep, key: string, from: number, to: number): IStep => {
        if (!step.steps) {
            return {
                ...step
            };
        } else if (step.key !== key) {
            return {
                ...step,
                steps: step.steps.map(s => {
                    return this.reorderStep(s, key, from, to)
                })
            };
        } else {
            const newSteps = step.steps.filter((s, index) => index !== from);
            return {
                ...step,
                steps: [
                    ...newSteps.slice(0, to),
                    step.steps[from],
                    ...newSteps.slice(to)
                ]
            };
        }
    }

    getStepByKey = (key: string): IStep => {
        const keyParts = key.split('.');
        return keyParts.reduce<IStep>((previous, current) => {
            const key = `${previous.key!}${previous.key! !== '' ? '.' : ''}${current}`;

            if (previous.steps) {
                const step = previous.steps.find(s => s.key! === key);
                if (step) {
                    return step;
                }
            } 

            return previous;
        }, this.state.script!.step);
    }

    renderStep = (step: IStep) => {
        return <IonItemGroup key={step.key!} class="scripts">
            <IonItemSliding>
                <IonItemOptions>
                    {step.type === Constants.STEP_LOOP || step.type === Constants.STEP_SEQUENTIAL
                        ? <IonItemOption onClick={() => this.addStepStart(step)}>
                            Add Step
                        </IonItemOption>    
                        : ''
                    }
                    <IonItemOption color="danger" onClick={() => this.setState({
                        script: {
                            ...this.state.script!,
                            step: this.deleteStep(step.key!, this.state.script!.step)
                        }
                    })}>
                        Delete
                    </IonItemOption>
                </IonItemOptions>
                <IonItem class="step-item">
                    <IonIcon name={this.state.menuOpen.includes(step.key!) ? "arrow-dropdown" : "arrow-dropright"} slot="start" onClick={() => {
                        if (this.state.menuOpen.includes(step.key!)) {
                            this.setState({
                                menuOpen: [
//                                    ...this.state.menuOpen.filter(m => m !== step.key!)
                                ]
                            });    
                        } else {
                            this.setState({
                                menuOpen: [
//                                    ...this.state.menuOpen,
                                    step.key!
                                ]
                            })
                        }
                    }} />
                    <IonLabel>{this.getStepTitle(step)}</IonLabel>
                    <IonReorder slot="end" />
                </IonItem>
            </IonItemSliding>
            {this.state.menuOpen.includes(step.key!)
                ? this.getStepPanel(step)
                : ''
            }
            {step.steps && step.steps.length > 0 
                ? <IonItem>
                    <IonReorderGroup class="step-item-steps" disabled={false} onIonItemReorder={event => this.reorder(step.key!, event)}>
                        {step.steps.map(subStep => {
                            return this.renderStep(subStep);
                        })}
                    </IonReorderGroup>
                </IonItem>
                : ''
            }
        </IonItemGroup>;
    }

    render() {
        return (
            <React.Fragment>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton onClick={() => {
                                this.setState({menuVisible: true});
                            }}>
                                <IonIcon slot="icon-only" name="menu" />
                            </IonButton>
                        </IonButtons>
                        <IonTitle>{this.state.script ? this.state.script.title || '-New-' : 'Scripts'}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    {this.state.script && this.state.script.step.steps ? (
                        <IonReorderGroup disabled={false} onIonItemReorder={event => this.reorder('', event)}>
                            {this.state.script.step.steps.map(step => {
                                return this.renderStep(step);
                            })}
                        </IonReorderGroup>
                    ) : ''}
                </IonContent>
                <IonAlert
                    isOpen={this.state.confirmDeleteOpen}
                    onDidDismiss={() => this.setState({ confirmDeleteOpen: false })}
                    header={'Delete Script?'}
                    message={'Are you sure you want to delete this script?'}
                    buttons={[{
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary'
                    }, {
                        text: 'Ok',
                        handler: () => {
                            this.props.deleteScript(this.state.script!.key || this.state.script!.title);
                            this.setState({
                                menuVisible: false
                            }, () => {
                                setTimeout((() => {
                                    this.props.history.push('/home');
                                }).bind(this), 500);                                    
                            });
                        }
                    }]}
                />
                <IonAlert
                    isOpen={this.state.saveDialogOpen}
                    onDidDismiss={() => this.setState({ saveDialogOpen: false })}
                    header={'Save Script?'}
                    message={'Please enter the script title.'}
                    inputs={[{
                        name: 'title',
                        type: 'text',
                        value: this.state.script ? this.state.script.title : '',
                        placeholder: 'Script Title'
                    }]}
                    buttons={[{
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary'
                    }, {
                        text: 'Ok',
                        handler: (value) => {
                            this.props.saveScript({
                                ...this.state.script!,
                                title: value.title
                            });
                            setTimeout((() => {
                                this.setState({
                                    menuVisible: false,
                                    script: {
                                        ...this.state.script!,
                                        title: value.title
                                    }
                                })
                            }).bind(this), 500);
                        }
                    }]}
                />
                <IonAlert
                    isOpen={this.state.addStepDialogOpen}
                    onDidDismiss={() => this.setState({ addStepDialogOpen: false })}
                    header={'Add Step?'}
                    message={'Please select a new step type.'}
                    inputs={[{
                        name: 'stepType',
                        type: 'radio',
                        label: 'Loop',
                        value: Constants.STEP_LOOP
                    }, {
                        name: 'stepType',
                        type: 'radio',
                        label: 'Feedback',
                        value: Constants.STEP_FEEDBACK
                    }, {
                        name: 'stepType',
                        type: 'radio',
                        label: 'Move Temperature',
                        value: Constants.STEP_MOVETEMP
                    }, {
                        name: 'stepType',
                        type: 'radio',
                        label: 'Timer',
                        value: Constants.STEP_TIMER
                    }, {
                        name: 'stepType',
                        type: 'radio',
                        label: 'Wait for Set Point',
                        value: Constants.STEP_WAITTEMP
                    }]}
                    buttons={[{
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary'
                    }, {
                        text: 'Ok',
                        handler: (value) => {
                            this.addStepComplete(value);
                            this.setState({
                                menuVisible: false
                            });
                        }
                    }]}
                />
                <IonPopover
                    isOpen={this.state.menuVisible}
                    onDidDismiss={() => this.setState(() => ({ menuVisible: false }))}
                >
                    <IonList>
                        <IonItem onClick={() => this.addStepStart(this.state.script!.step)}>
                            <IonIcon name="add" slot="start" />
                            <IonLabel>Add Step</IonLabel>
                        </IonItem>
                        <IonItem onClick={this.createNew}>
                            <IonIcon name="code" slot="start" />
                            <IonLabel>New Script</IonLabel>
                        </IonItem>
                        <IonItem onClick={this.saveScript}>
                            <IonIcon name="save" slot="start" />
                            <IonLabel>Save Script</IonLabel>
                        </IonItem>
                        <IonItem onClick={this.deleteScript}>
                            <IonIcon name="trash" slot="start" />
                            <IonLabel>Delete Script</IonLabel>
                        </IonItem>
                    </IonList>
                </IonPopover>                
            </React.Fragment>
        );
    }

    getNewStep = (type: string): IStep => {
        const base = {
            type,
            steps: []
        };
        switch (type) {
            case Constants.STEP_LOOP: {
                return {
                    ...base,
                    count: 1
                } as ILoopStep;
            }
            case Constants.STEP_MOVETEMP: {
                return {
                    ...base,
                    value: 20
                } as IMoveTempStep;
            }
            case Constants.STEP_TIMER: {
                return {
                    ...base,
                    timeout: 5
                } as ITimerStep;
            }
            case Constants.STEP_WAITTEMP: {
                return {
                    ...base,
                    offset: 0,
                    direction: Direction.DOWN,
                    timeout: 90
                } as IWaitTempStep
            }
            default: {
                return {
                    ...base,
                } as IStep
            }
        }
    }

    setStepValue = (updatedStep: Step) => {
        this.setState({
            script: {
                ...this.state.script!,
                step: this.updateStepValue(this.state.script!.step, updatedStep)
            }
        });
    }

    updateStepValue = (step: IStep, updatedStep: Step): IStep => {
        const props = step.key! === updatedStep.key! ? updatedStep : {};
        const newStep = {
            ...step,
            ...props,
            steps: step.steps!.map(s => this.updateStepValue(s, updatedStep))
        };
        return newStep;
    }

    getStepPanel = (step: IStep) => {
        switch (step.type) {
            case Constants.STEP_LOOP: {
                const loop = step as ILoopStep;
                return (
                    <IonItem class="step-panel">
                        <IonLabel position="fixed">Count <IonText color="danger">*</IonText></IonLabel>
                        <IonInput 
                            type="number"
                            value={loop.count.toString()}
                            required={true}
                            placeholder="# of Loops"
                            onIonChange={event => {
                                const value = parseInt(event.detail.value as string);
                                if (isNaN(value)) {
                                    return;   
                                }
                                this.setStepValue({...loop, count: value});
                            }}
                        />
                    </IonItem>
                );
            }
    
            case Constants.STEP_TIMER: {
                const timer = step as ITimerStep;
                return (
                    <IonItem class="step-panel">
                        <IonLabel position="fixed">Timeout <IonText color="danger">*</IonText></IonLabel>
                        <IonInput 
                            type="number"
                            value={timer.timeout.toString()}
                            required={true}
                            placeholder="Timeout in seconds"
                            onIonChange={event => {
                                const value = parseInt(event.detail.value as string);
                                if (isNaN(value)) {
                                    return;   
                                }
                                this.setStepValue({...timer, timeout: value});
                            }}
                        />
                    </IonItem>
                );
            }

            case Constants.STEP_WAITTEMP: {
                const waitStep = step as IWaitTempStep;
                return (
                    <IonItemGroup class="step-panel">
                    <IonItem class="step-panel-item">
                        <IonLabel position="fixed">Direction <IonText color="danger">*</IonText></IonLabel>
                        <IonSelect
                            value={waitStep.direction}
                            placeholder="Direction"
                            onIonChange={event => {
                                const value = event.detail.value
                                if (![Direction.DOWN, Direction.UP].includes(value)) {
                                    return;
                                }
                                this.setStepValue({...waitStep, direction: value});
                            }}
                        >
                            <IonSelectOption value={Direction.DOWN}>Down</IonSelectOption>
                            <IonSelectOption value={Direction.UP}>Up</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem class="step-panel-item">
                        <IonLabel position="fixed">Offset <IonText color="danger">*</IonText></IonLabel>
                        <IonInput 
                            type="number"
                            value={waitStep.offset.toString()}
                            required={true}
                            placeholder="Offset degrees"
                            onIonChange={event => {
                                const value = parseInt(event.detail.value as string);
                                if (isNaN(value)) {
                                    return;   
                                }
                                this.setStepValue({...waitStep, offset: value});
                            }}
                        />
                    </IonItem>
                    <IonItem class="step-panel-item">
                        <IonLabel position="fixed">Timeout <IonText color="danger">*</IonText></IonLabel>
                        <IonInput 
                            type="number"
                            value={waitStep.timeout.toString()}
                            required={true}
                            placeholder="Timeout in seconds"
                            onIonChange={event => {
                                const value = parseInt(event.detail.value as string);
                                if (isNaN(value)) {
                                    return;   
                                }
                                this.setStepValue({...waitStep, timeout: value});
                            }}
                        />
                    </IonItem>
                    </IonItemGroup>
                );
            }
    
            case Constants.STEP_MOVETEMP: {
                const moveStep = step as IMoveTempStep;
                return (
                    <IonItem class="step-panel">
                        <IonLabel position="fixed">Change (+/-) <IonText color="danger">*</IonText></IonLabel>
                        <IonInput 
                            type="number"
                            value={moveStep.value.toString()}
                            required={true}
                            placeholder="Temperature change in \xb0"
                            onIonChange={event => {
                                const value = parseInt(event.detail.value as string);
                                if (isNaN(value)) {
                                    return;   
                                }
                                this.setStepValue({...moveStep, value });
                            }}
                        />
                    </IonItem>
                );
            }
    
            case Constants.STEP_FEEDBACK: {
                const feedbackStep = step as IFeedbackStep;
                return (
                    <IonItemGroup class="step-panel">
                    <IonItem class="step-panel-item">
                        <IonLabel position="fixed">Icon <IonText color="danger">*</IonText></IonLabel>
                        <IonSelect
                            value={feedbackStep.icon || ''}
                            placeholder="Icon"
                            onIonChange={event => {
                                const value = event.detail.value;
                                if (Constants.ICONS.findIndex(i => i.value === value) < 0) {
                                    return;
                                }
                                this.setStepValue({...feedbackStep, icon: value});
                            }}
                        >{Constants.ICONS.map(icon => {
                            return <IonSelectOption key={icon.value} value={icon.value}>{icon.title}</IonSelectOption>;
                        })}
                        </IonSelect>
                    </IonItem>
                    <IonItem class="step-panel-item">
                        <IonLabel position="fixed">Flash (s) <IonText color="danger">*</IonText></IonLabel>
                        <IonInput 
                            type="number"
                            value={(feedbackStep.flashRate || 0).toString()}
                            required={true}
                            placeholder="Icon flash rate"
                            onIonChange={event => {
                                const value = parseInt(event.detail.value as string);
                                if (isNaN(value)) {
                                    return;   
                                }
                                this.setStepValue({...feedbackStep, flashRate: value});
                            }}
                        />
                    </IonItem>
                    <IonItem class="step-panel-item">
                        <IonLabel position="fixed">Sound <IonText color="danger">*</IonText></IonLabel>
                        <IonSelect
                            value={feedbackStep.sound || ''}
                            placeholder="Icon"
                            onIonChange={event => {
                                const value = event.detail.value;
                                if (Constants.SOUNDS.findIndex(s => s.value === value) < 0) {
                                    return;
                                }
                                this.setStepValue({...feedbackStep, sound: value});
                            }}
                        >{Constants.SOUNDS.map(sound => {
                            return <IonSelectOption key={sound.value} value={sound.value}>{sound.title}</IonSelectOption>;
                        })}
                        </IonSelect>
                    </IonItem>
                    <IonItem class="step-panel-item">
                        <IonLabel position="fixed">LED (s) <IonText color="danger">*</IonText></IonLabel>
                        <IonInput 
                            type="number"
                            value={(feedbackStep.led || 0).toString()}
                            required={true}
                            placeholder="LED flash rate"
                            onIonChange={event => {
                                const value = parseInt(event.detail.value as string);
                                if (isNaN(value)) {
                                    return;   
                                }
                                this.setStepValue({...feedbackStep, led: value});
                            }}
                        />
                    </IonItem>
                    </IonItemGroup>
                );
            }
  
            default: {
                return "";
            }
        }
    }

    getStepTitle = (step: IStep) => {
        switch (step.type) {
            case Constants.STEP_LOOP: {
                return `Loop Step (${(step as ILoopStep).count})`;
            }
            case Constants.STEP_FEEDBACK: {
                return `Feedback Step`;
            }
            case Constants.STEP_MOVETEMP: {
                return `Move Temperature Step (${(step as IMoveTempStep).value})`;
            }
            case Constants.STEP_SEQUENTIAL: {
                return "Sequential Step";
            }
            case Constants.STEP_TIMER: {
                return `Timer Step (${(step as ITimerStep).timeout}s)`;
            }
            case Constants.STEP_WAITTEMP: {
                return "Wait for Set Point";
            }
            default: {
                return "Invalid Step";
            }
        }
    }
}