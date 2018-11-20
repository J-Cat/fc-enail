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
import { Form, Button, Collapse, InputNumber, Select } from 'antd';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { ScriptsProps } from './container';
import { IStep } from '../../models/IStep';
import { moveStep } from '../../helpers/stepHelper';
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
                index: 0,
                title: 'New Script',
                step: {
                    type: "sequential",
                    steps: []
                }
            }
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
            }
        });
    }

    submit = (e: React.FormEvent) => {
        e.preventDefault();

        const step = this.getUpdatedStep(this.state.script.step);
        alert(JSON.stringify(step));
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
                newStep = {
                    ...step,
                    flashRate: this.props.form.getFieldValue(`${step.key}-flash`) || undefined,
                    icon: this.props.form.getFieldValue(`${step.key}-icon`) || undefined,
                    led: this.props.form.getFieldValue(`${step.key}-led`) || undefined,
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
            case Constants.STEP_SEQUENTIAL: {
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
                ? (step.type === Constants.STEP_SEQUENTIAL) || (step.type === Constants.STEP_LOOP) ? [] : undefined
                : step.steps.map(s => {
                    return this.getUpdatedStep(s);
                })
        };
    }

    render() {
        const getFieldDecorator = this.props.form.getFieldDecorator;
        
        return (<div className="scripts">
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
                                                        {container(step, getFieldDecorator)}
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
                        <Button
                            type="primary"
                            htmlType="button"
                        >
                            Add Step
                        </Button>
                        &nbsp;&nbsp;
                        <Button
                            type="primary"
                            htmlType="button"
                        >
                            Create New
                        </Button>
                    </FormItem>
                </Form>                    
            </div>
        </div>);
    }
}

const container = (item: IStep, getFieldDecorator: (...args: any) => any) => {
    return (<Droppable droppableId={`${item.key}`} type='container'>
        {(provided, snapshot) => (
            <div 
                ref={provided.innerRef}
                className={`step-droppable${snapshot.isDraggingOver ? ' step-droppable-dragging' : ''}`}
            >
                {stepBar(item, 'step-droppable-title', getFieldDecorator)}
                {item.steps ? item.steps.map((step: IStep, index: number) => (
                    <Draggable key={step.key!} draggableId={step.key!} index={index}>
                        {(provided1, snapshot1) => (
                            <div
                                ref={provided1.innerRef}
                                {...provided1.draggableProps}
                                {...provided1.dragHandleProps}
                                className={`step-draggable${snapshot1.isDragging ? ' step-draggable-dragging' : ''}`}
                            >
                                {stepBar(step, 'step-draggable-title', getFieldDecorator)}
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

const stepBar = (step: IStep, classname: string, getFieldDecorator: (...args: any) => any) => {
    return (
        <Collapse className={classname}>
            {getStepPanel(step, getFieldDecorator)}
        </Collapse>
    )
}

const getStepPanel = (step: IStep, getFieldDecorator: (...args: any) => any) => {
    switch (step.type) {
        case Constants.STEP_LOOP: {
            const loop = step as ILoopStep;
            return (<Panel key={step.key!} header={getStepTitle(step)}>
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
            </Panel>);
        }

        case Constants.STEP_TIMER: {
            return (<Panel key={step.key!} header={getStepTitle(step)}>
                <div>
                    <FormItem label="Count">
                        {getFieldDecorator(`${step.key}-count`, {
                            rules: [{ required: true, message: 'Please enter a # of loops >=1!' }],
                            initialValue: (step as ITimerStep).timeout
                        })(
                            <InputNumber />
                        )}
                    </FormItem>
                </div>
            </Panel>);
        }

        case Constants.STEP_WAITTEMP: {
            return (<Panel key={step.key!} header={getStepTitle(step)}>
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
            </Panel>);
        }

        case Constants.STEP_MOVETEMP: {
            const temp = step as IMoveTempStep;
            return (<Panel key={step.key!} header={getStepTitle(step)}>
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
            </Panel>);
        }

        case Constants.STEP_FEEDBACK: {
            const feedback = step as IFeedbackStep;
            return (<Panel key={step.key!} header={getStepTitle(step)}>
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
            </Panel>);
        }

        default: {
            return <Panel key={step.key!} header={getStepTitle(step)} />;
        }
    }
}

const getStepTitle = (step: IStep) => {
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

const ScriptsForm = Form.create()(Scripts);

export default ScriptsForm;