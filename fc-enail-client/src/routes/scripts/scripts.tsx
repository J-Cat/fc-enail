/*
 * File: c:\fc-enail\fc-enail-client\src\routes\scripts\scripts.tsx
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
import { Prompt } from 'react-router';
import { Form, Button, Dropdown, InputNumber, Select, Menu, Collapse } from 'antd';
import { Modal, Toast } from 'antd-mobile';
import { Action } from 'antd-mobile/lib/modal/PropsType';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { ScriptsProps } from './container';
import { IStep } from '../../models/IStep';
import { IEnailScript } from '../../models/IEnailScript';
import { moveStep, remapScript, addItem, deleteKey } from '../../helpers/stepHelper';
// import { ISequentialStep } from '../../models/ISequentialStep';
import { ILoopStep } from '../../models/ILoopStep';
import { IMoveTempStep } from '../../models/IMoveTempStep';
import { IFeedbackStep } from '../../models/IFeedbackStep';
import { IWaitTempStep, Direction } from '../../models/IWatiTempStep';
import { ITimerStep } from '../../models/ITimerStep';
import * as Constants from '../../models/constants';
// import config from '../../config';

import './scripts.less';

const FormItem = Form.Item;
const Panel = Collapse.Panel;

export class Scripts extends React.Component<ScriptsProps.IProps, ScriptsProps.IState> {
    constructor(props: ScriptsProps.IProps) {
        super(props);
        this.state = {
            script: this.props.script || {
                title: '',
                step: remapScript({
                    type: Constants.STEP_SEQUENTIAL,
                    steps: []
                })
            },
            changed: false,
            saved: false
        };
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    onDragEnd(result: DropResult) {
        if (!result.destination) {
            return;
        }

        const step = moveStep(this.state.script.step, result.draggableId, result.destination.droppableId, result.destination.index);

        this.setState({
            script: {
                ...this.state.script,
                step
            },
            changed: true
        });
    }

    createNew = (e: React.FormEvent) => {
        e.preventDefault();

        const script = {
            title: '',
            step: remapScript({
                type: Constants.STEP_SEQUENTIAL,
                steps: []
            })
        } as IEnailScript;

        this.setState({
            script
        });
    }

    submit = (e: React.FormEvent) => {
        e.preventDefault();

        this.props.form.validateFields((errors: any, values: any) => {
            if (errors) {
                return;
            }

            const modal = Modal.prompt('Save Script', 'Please enter the script name.', [{
                text: 'Ok',
                onPress: (value: string) => {
                    if (!value) {
                        return;
                    }
                    return new Promise<void>((resolve) => {
                        Toast.info(`Saving script: ${value}`, 1);
                        setTimeout(() => {
                            const step = this.getUpdatedStep(this.state.script.step);
                            this.props.saveScript({
                                title: value,
                                step
                            } as IEnailScript);
                            this.setState({
                                changed: false,
                                saved: true
                            });
                            this.props.history.push('/home');
                            resolve();
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
            this.state.script.title || '', ['enter a script name']);
        });
    }

    deleteScript = (e: React.FormEvent) => {
        e.preventDefault();

        const modal = Modal.alert('Delete Script?', `Are you sure you want to delete this scipt:  ${this.state.script.title}?`, [
            { text: 'Cancel', onPress: () => {modal.close();} },
            { 
                text: 'Ok', 
                onPress: () => {
                    return new Promise<void>((resolve, reject) => {
                        Toast.info(`Deleting script ...`, 1);
                        setTimeout(() => {
                            this.props.deleteScript(this.state.script.title);
                            this.setState({
                                saved: true
                            });
                            resolve();
                            modal.close();
                            this.props.history.push('/home');
                        }, 1000);
                    })    
                }
            }
        ]);
    }

    getUpdatedStep = (step: IStep): IStep => {
        let newStep: IStep;
        switch (step.type) {
            case Constants.STEP_LOOP: {
                newStep = {
                    ...step,
                    count: this.props.form.getFieldValue(`${step.key}-count`)
                } as ILoopStep;
                break;
            }
            case Constants.STEP_FEEDBACK: {
                const flashRate = this.props.form.getFieldValue(`${step.key}-flash`);
                const led = this.props.form.getFieldValue(`${step.key}-led`);
                newStep = {
                    ...step,
                    flashRate: flashRate === undefined || flashRate === '' ? undefined : flashRate,
                    icon: this.props.form.getFieldValue(`${step.key}-icon`) || undefined,
                    led: led === undefined || led === '' ? undefined : led,
                    sound: this.props.form.getFieldValue(`${step.key}-sound`) || undefined
                } as IFeedbackStep;
                break;
            }
            case Constants.STEP_MOVETEMP: {
                newStep = {
                    ...step,
                    value: this.props.form.getFieldValue(`${step.key}-value`)
                } as IMoveTempStep;
                break;
            }
            case Constants.STEP_TIMER: {
                newStep = {
                    ...step,
                    timeout: this.props.form.getFieldValue(`${step.key}-timeout`)
                } as ITimerStep;
                break;
            }
            case Constants.STEP_WAITTEMP: {
                newStep = {
                    ...step,
                    direction: this.props.form.getFieldValue(`${step.key}-direction`),
                    offset: this.props.form.getFieldValue(`${step.key}-offset`),
                    timeout: this.props.form.getFieldValue(`${step.key}-timeout`)
                } as IWaitTempStep;
                break;
            }
            default: {
                newStep = {
                    ...step
                };
                break;
            }
        }
        return {
            ...newStep!,
            steps: !step.steps 
                ? []
                : step.steps.map(s => {
                    return this.getUpdatedStep(s);
                })
        };
    }

    render() {
        const getFieldDecorator = this.props.form.getFieldDecorator;
        
        return (<div className="scripts">
        <React.Fragment>
            <Prompt
                when={(this.props.form.isFieldsTouched() || this.state.changed) && !this.state.saved}
                message='You have unsaved changes to your script, are you sure you want to leave?'
            />
            {/* Component JSX */}
        </React.Fragment>            
        <div className="version-label">{this.props.version}</div>
            <div className="scripts-content">
                <Form onSubmit={this.submit}>
                    <div className='scripts-content-datarow' style={{flexDirection: "column", display: "flex"}}>
                        {// tslint:disable-next-line:no-console jsx-no-lambda
                        <DragDropContext onDragEnd={this.onDragEnd}>
                            <Droppable droppableId='root' type='rootContainer'>
                                {(provided, snapshot) => (
                                    <div 
                                        ref={provided.innerRef}
                                        className="step-droppable"
                                    >
                                        {this.state.script && this.state.script.step && this.state.script.step.steps 
                                            ? this.state.script.step.steps.map((step, index) => (
                                                <Draggable key={step.key!} draggableId={step.key!} index={index}>
                                                {(provided1, snapshot1) => (
                                                    <div
                                                        ref={provided1.innerRef}
                                                        {...provided1.draggableProps}
                                                        {...provided1.dragHandleProps}
                                                        className={`step-draggable${snapshot1.isDragging ? ' step-draggable-dragging' : ''}`}
                                                        >
                                                        {this.container(step, getFieldDecorator)}
                                                    </div>
                                                )}
                                                </Draggable>
                                            )) : ''
                                        }
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        }
                    </div>
                    <FormItem className="scripts-content-buttonrow">
                        <Button
                            type="primary"
                            htmlType="submit"
                        >
                            Save
                        </Button>
                        &nbsp;&nbsp;
                        <Dropdown overlay={this.overlay(this.state.script.step)}>
                            <Button
                                type="primary"
                                htmlType="button"
                            >
                                Add Step
                            </Button>
                        </Dropdown>
                        &nbsp;&nbsp;
                        <Button
                            type="primary"
                            htmlType="button"
                            onClick={this.createNew}
                        >
                            Create
                        </Button>
                        &nbsp;&nbsp;
                        <Button
                            type="primary"
                            htmlType="button"
                            onClick={this.deleteScript}
                        >
                            Delete
                        </Button>
                    </FormItem>
                </Form>                    
            </div>
        </div>);
    }

    container = (item: IStep, getFieldDecorator: (...args: any) => any) => {
        return (<Droppable droppableId={`${item.key}`} type='container'>
            {(provided, snapshot) => (
                <div 
                    ref={provided.innerRef}
                    className={`step-droppable${snapshot.isDraggingOver ? ' step-droppable-dragging' : ''}`}
                >
                    {this.stepBar(item, 'step-droppable-title', getFieldDecorator)}
                    {item.steps ? item.steps.map((step: IStep, index: number) => (
                        <Draggable key={step.key!} draggableId={step.key!} index={index}>
                            {(provided1, snapshot1) => (
                                <div
                                    ref={provided1.innerRef}
                                    {...provided1.draggableProps}
                                    {...provided1.dragHandleProps}
                                    className={`step-draggable${snapshot1.isDragging ? ' step-draggable-dragging' : ''}`}
                                >
                                    {this.stepBar(step, 'step-draggable-title', getFieldDecorator)}
                                </div>
                            )}
                        </Draggable>
                    )) : ''}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
        );
    }
    
    stepBar = (step: IStep, classname: string, getFieldDecorator: (...args: any) => any) => {
        return (
            <Collapse className={classname} accordion={true}>
                {this.getStepPanel(step, getFieldDecorator)}
            </Collapse>
        )
    }
    
    addItemInternal = (step: IStep, type: string) => {
        // e.preventDefault();
        // e.stopPropagation();

        const newRoot = remapScript(addItem(
            this.state.script.step, {
                type,
                steps: type === Constants.STEP_LOOP ? [] : undefined
            },
            step.key!,
            step.steps!.length
        ));
        this.setState({
            changed: true,
            script: {
                ...this.state.script,
                step: newRoot
            }
        });
    }
    
    delItemInternal = (e: React.FormEvent, step: IStep) => {
        e.preventDefault();
        e.stopPropagation();
        const modal = Modal.alert('Delete Step', `Are you sure you want to delete this step:  ${this.getStepTitle(step)}?`, [
            { text: 'Cancel', onPress: () => {modal.close();} },
            { 
                text: 'Ok', 
                onPress: () => {
                    return new Promise<void>((resolve, reject) => {
                        Toast.info(`Deleting step ...`, 1);
                        setTimeout(() => {
                            const newRoot = remapScript(deleteKey(this.state.script.step, step.key!));
                            this.setState({
                                script: {
                                    ...this.state.script,
                                    step: newRoot
                                },
                                changed: true
                            });
                            resolve();
                            modal.close();
                        }, 1000);
                    })    
                }
            }
        ]);
    }
    
    getStepPanel = (step: IStep, getFieldDecorator: (...args: any) => any) => {
        switch (step.type) {
            case Constants.STEP_LOOP: {
                const loop = step as ILoopStep;
                return (
                    <Panel key={step.key!} header={this.getHeader(step)}>
                        <div>
                            <FormItem label="Count">
                                {getFieldDecorator(`${step.key}-count`, {
                                    rules: [{ required: true, message: 'Please enter a # of loops >=1!' }],
                                    initialValue: loop.count
                                })(
                                    <InputNumber />
                                )}
                            </FormItem>
                        </div>
                    </Panel>
                );
            }
    
            case Constants.STEP_TIMER: {
                return (
                    <Panel key={step.key!} header={this.getHeader(step)}>
                        <div>
                            <FormItem label="Timeout">
                                {getFieldDecorator(`${step.key}-timeout`, {
                                    rules: [{ required: true, message: 'Please enter a timeout in seconds.' }],
                                    initialValue: (step as ITimerStep).timeout
                                })(
                                    <InputNumber />
                                )}
                            </FormItem>
                        </div>
                    </Panel>
                );
            }
    
            case Constants.STEP_WAITTEMP: {
                return (
                    <Panel key={step.key!} header={this.getHeader(step)}>
                        <div>
                            <FormItem label="Direction">
                                {getFieldDecorator(`${step.key}-direction`, {
                                    rules: [{ required: true, message: 'Please select a direction!' }],
                                    initialValue: (step as IWaitTempStep).direction
                                })(
                                    <Select>
                                        <Select.Option key={Direction.DOWN} value={Direction.DOWN}>Down</Select.Option>
                                        <Select.Option key={Direction.UP} value={Direction.UP}>Up</Select.Option>
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem label="Offset">
                                {getFieldDecorator(`${step.key}-offset`, {
                                    rules: [{ required: true, message: 'Please enter an offset.' }],
                                    initialValue: (step as IWaitTempStep).offset
                                })(
                                    <InputNumber />
                                )}
                            </FormItem>
                            <FormItem label="Timeout (s)">
                                {getFieldDecorator(`${step.key}-timeout`, {
                                    rules: [{ required: true, message: 'Please enter a timeout in seconds.' }],
                                    initialValue: (step as IWaitTempStep).timeout
                                })(
                                    <InputNumber />
                                )}
                            </FormItem>
                        </div>
                    </Panel>
                );
            }
    
            case Constants.STEP_MOVETEMP: {
                const temp = step as IMoveTempStep;
                return (
                    <Panel key={step.key!} header={this.getHeader(step)}>
                        <div>
                            <FormItem label="Change (+/-)">
                                {getFieldDecorator(`${step.key}-value`, {
                                    rules: [{ required: true, message: 'Please enter a change in temperature.' }],
                                    initialValue: temp.value
                                })(
                                    <InputNumber />
                                )}
                            </FormItem>
                        </div>
                    </Panel>
                );
            }
    
            case Constants.STEP_FEEDBACK: {
                const feedback = step as IFeedbackStep;
                return (
                    <Panel key={step.key!} header={this.getHeader(step)}>
                        <div>
                            <FormItem label="Icon">
                                {getFieldDecorator(`${step.key}-icon`, {
                                    rules: [{ required: false, message: 'Please select an icon.' }],
                                    initialValue: feedback.icon
                                })(
                                    <Select>
                                        <Select.Option key="" value="">-None-</Select.Option>
                                        <Select.Option key="home" value="home">Home</Select.Option>
                                        <Select.Option key="cloud" value="cloud">Cloud</Select.Option>
                                        <Select.Option key="drop" value="drop">Drop</Select.Option>
                                        <Select.Option key="gear" value="gear">Gear</Select.Option>
                                        <Select.Option key="script" value="script">Script</Select.Option>
                                        <Select.Option key="thermometerDown" value="thermometerDown">Thermometer</Select.Option>
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem label="Flash (s)">
                                {getFieldDecorator(`${step.key}-flash`, {
                                    rules: [{ required: false, message: 'Please enter a flash rate in seconds. (0 for always on)' }],
                                    initialValue: feedback.flashRate || 0
                                })(
                                    <InputNumber />
                                )}
                            </FormItem>
                            <FormItem label="Sound">
                                {getFieldDecorator(`${step.key}-sound`, {
                                    rules: [{ required: false, message: 'Please select a sound.' }],
                                    initialValue: feedback.sound
                                })(
                                    <Select>
                                        <Select.Option key="" value="">-None-</Select.Option>
                                        <Select.Option key="appear" value="appear">Appear</Select.Option>
                                        <Select.Option key="beep" value="beep">Beep</Select.Option>
                                        <Select.Option key="bell" value="bell">Bell</Select.Option>
                                        <Select.Option key="chime" value="chime">Chime</Select.Option>
                                        <Select.Option key="complete" value="complete">Complete</Select.Option>
                                        <Select.Option key="disconnected" value="disconnected">Disconnected</Select.Option>
                                        <Select.Option key="error" value="error">Error</Select.Option>
                                        <Select.Option key="money" value="money">Money</Select.Option>
                                        <Select.Option key="organ" value="organ">Organ</Select.Option>
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem label="LED (s)">
                                {getFieldDecorator(`${step.key}-led`, {
                                    rules: [{ required: false, message: 'Please enter a flash rate for the LED. (0 for always on)' }],
                                    initialValue: feedback.led
                                })(
                                    <InputNumber />
                                )}
                            </FormItem>
                        </div>
                    </Panel>
                );
            }
    
            default: {
                return <Panel key={step.key!} header={this.getHeader(step)} />;
            }
        }
    }

    getHeader = (step: IStep) => {
        return (
            <div className="step-panel-bar">
                <div className="step-panel-bar-label">
                    {this.getStepTitle(step)}
                </div>
                <div className="step-panel-bar-buttons">
                    { 
                        step.type === Constants.STEP_LOOP || step.type === Constants.STEP_SEQUENTIAL
                            ? this.getAddButton(step)
                            : ''
                    }
                    {
                        // tslint:disable-next-line:jsx-no-lambda
                        <Button icon="close-circle" onClick={(e: React.FormEvent) => this.delItemInternal(e, step)} />
                    }
                </div>
            </div>
        );
    }
    overlay = (step: IStep) => (
        <Menu onClick={
            // tslint:disable-next-line:jsx-no-lambda
            (param) => this.addItemInternal(step, param.key)
        }>
            { step.key === '' 
                ? <Menu.Item key={Constants.STEP_LOOP}>Loop</Menu.Item>
                : ''
            }
            <Menu.Item key={Constants.STEP_FEEDBACK}>Feedback</Menu.Item>
            <Menu.Item key={Constants.STEP_MOVETEMP}>Move Temp</Menu.Item>
            <Menu.Item key={Constants.STEP_TIMER}>Timer</Menu.Item>
            <Menu.Item key={Constants.STEP_WAITTEMP}>Wait</Menu.Item>
        </Menu>
    );

    getAddButton = (step: IStep) => {
        return (<div>
            <Dropdown overlay={this.overlay(step)}>
                <Button onClick={
                    // tslint:disable-next-line:jsx-no-lambda
                    (e: React.FormEvent) => { 
                        e.preventDefault();
                        e.stopPropagation();
                    }
                } icon="plus-circle" />
            </Dropdown>
        </div>);
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


const ScriptsForm = Form.create()(Scripts);

export default ScriptsForm;