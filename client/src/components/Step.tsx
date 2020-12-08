import { Button, Collapse, Form, Input, InputNumber, Select } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { Icons, IIcon } from '../models/icons';
import { IStep, StepTypeEnum, ISequentialStep, IFeedbackStep, ITimerStep, IUpdateSetPointStep, IWaitForSetPointStep } from '../models/IScript';
import { ISounds } from '../models/ISounds';
import { RootState } from '../store/reducers/rootReducer';

const Panel = Collapse.Panel;
const FormItem = Form.Item;
const Option = Select.Option;

interface IStepProps {
  step: IStep;
  isOpen: boolean;
  onChange?: (step: IStep) => void;
  onOpenClose?: (isOpen: boolean, key: string) => void
  onDelete?: (key: string) => void;
}

export const parseIntDefault = (value: string, defaultValue: number): number => {
  const parsed = parseInt(value);
  if (isNaN(parsed)) {
    return defaultValue;
  }
  return parsed;
};

export const Step: React.FC<IStepProps> = ({ step, isOpen, onChange, onOpenClose, onDelete }: IStepProps) => {
  const Sounds = useSelector<RootState, ISounds>(state => state.sounds.sounds);
  const getString = () => {
    switch (step.type) {
    case StepTypeEnum.SequentialStep: {
      return `Loop ${(step as ISequentialStep).loop} times`;
    }
    case StepTypeEnum.FeedbackStep: {
      const typedStep = step as IFeedbackStep;
      return `Feedback${typedStep.text ? ` ${typedStep.text}` : ''}`;
    }
    case StepTypeEnum.TimerStep: {
      return `Wait ${(step as ITimerStep).duration} sec`;
    }
    case StepTypeEnum.UpdateSetPointStep: {
      const typedStep = step as IUpdateSetPointStep;
      if (typedStep.updateType === 'fixed') {
        return `Set to ${(step as IUpdateSetPointStep).value}F`;
      }
      if (typedStep.value > 0 ) {
        return `Increase by ${typedStep.value}F`;
      } else if (typedStep.value < 0) {
        return `Decrease by ${Math.abs(typedStep.value)}F`;        
      }

      return 'No change.';
    }
    case StepTypeEnum.WaitForSetPointStep: {
      return 'Wait for Set Point';
    }
    }
  };

  const renderFeedbackStep = (typedStep: IFeedbackStep): JSX.Element => {
    return <React.Fragment>
      <FormItem label="Text">
        <Input defaultValue={typedStep.text} onBlur={(value) => {
          onChange?.({
            ...step, 
            text: value.target.value,
          } as IFeedbackStep);
          value.preventDefault();
        }} />
      </FormItem>
      <FormItem label="Sound">
        <Select 
          defaultValue={typedStep.sound}
          onChange={(value) => {
            onChange?.({
              ...step, 
              sound: value,
            } as IFeedbackStep);  
          }}
        >
          {Object.keys(Sounds).map((soundKey: string) => {
            const value = (Sounds as { [key: string]: string })[soundKey];
            if (!value) {
              return '';
            }
            return <Option key={value} value={value}>{value.replace(/^([^.])([^.]+).wav$/, ($0, $1, $2) => {
              return `${$1.toUpperCase()}${$2}`;
            })}</Option>;
          })}
        </Select>
      </FormItem>
      <FormItem label="Icon">
        <Select 
          defaultValue={typedStep.icon}
          onChange={(value) => {
            onChange?.({
              ...step, 
              icon: value,
            } as IFeedbackStep);  
          }}
        >
          {Object.keys(Icons).map((iconKey: string) => {
            const value = (Icons as { [key: string]: IIcon })[iconKey];
            if (!value) {
              return '';
            }
            return <Option key={iconKey} value={iconKey}>{iconKey.replace(/^([^.])([^.]+)$/, ($0, $1, $2) => {
              return `${$1.toUpperCase()}${$2}`;
            })}</Option>;
          })}
        </Select>
      </FormItem>
    </React.Fragment>;    
  };

  const renderTimerStep = (typedStep: ITimerStep): JSX.Element => {
    return <React.Fragment>
      <FormItem label="Duration (in seconds)">
        <InputNumber defaultValue={typedStep.duration} onBlur={(value) => {
          onChange?.({
            ...step, 
            duration: parseIntDefault(value.target.value, typedStep.duration),
          } as ITimerStep);
        }} />
      </FormItem>
    </React.Fragment>;    
  };

  const renderWaitForSetPointStep = (typedStep: IWaitForSetPointStep): JSX.Element => {
    return <React.Fragment>
      <FormItem label="Timeout (in seconds)">
        <InputNumber defaultValue={typedStep.timeout} onBlur={(value) => {
          onChange?.({
            ...step, 
            timeout: parseIntDefault(value.target.value, typedStep.timeout),
          } as IWaitForSetPointStep);
        }} />
      </FormItem>
      <FormItem label="Offset">
        <InputNumber 
          defaultValue={typedStep.offset} 
          min={0}
          max={10}
          onBlur={(value) => {
            onChange?.({
              ...step, 
              offset: parseIntDefault(value.target.value, typedStep.offset),
            } as IWaitForSetPointStep);
          }} 
        />
      </FormItem>
    </React.Fragment>;    
  };

  const renderUpdateSetPointStep = (typedStep: IUpdateSetPointStep): JSX.Element => {
    return <React.Fragment>
      <FormItem label="Type">
        <Select defaultValue={typedStep.updateType} onChange={(value) => {
          onChange?.({
            ...step, 
            updateType: value || 'increment',
          } as IUpdateSetPointStep);
        }}>
          <Option key="fixed" value="fixed">Fixed</Option>
          <Option key="increment" value="increment">Increment</Option>
        </Select>
      </FormItem>
      <FormItem label="Value">
        <InputNumber defaultValue={typedStep.value} onBlur={(value) => {
          onChange?.({
            ...step, 
            value: parseIntDefault(value.target.value, typedStep.value),
          } as IUpdateSetPointStep);
        }} />
      </FormItem>
    </React.Fragment>;    
  };

  const StepWrapper = (contents: JSX.Element): JSX.Element => {
    return <div>
      {contents}
      <FormItem>
        <Button 
          type="primary" 
          htmlType="button"
          onClick={() => {
            // eslint-disable-next-line react/prop-types
            onDelete?.(step.key);
          }}
        >
          Delete Step
        </Button>
      </FormItem>
    </div>;
  };

  const PanelContent = (): JSX.Element  => {
    switch (step.type) {
    case StepTypeEnum.FeedbackStep: {
      return StepWrapper(renderFeedbackStep(step as IFeedbackStep));
    }
    case StepTypeEnum.TimerStep: {
      return StepWrapper(renderTimerStep(step as ITimerStep));
    }
    case StepTypeEnum.WaitForSetPointStep: {
      return StepWrapper(renderWaitForSetPointStep(step as IWaitForSetPointStep));
    }
    case StepTypeEnum.UpdateSetPointStep: {
      return StepWrapper(renderUpdateSetPointStep(step as IUpdateSetPointStep));
    }
    }
    return <React.Fragment />;
  };

  return <Collapse 
    bordered={true} 
    accordion={true} 
    activeKey={isOpen ? 'key' : undefined}
    onChange={(panel) => {
      onOpenClose?.(panel !== undefined, step.key);
    }}
  >
    <Panel key={'key'} header={getString()}>
      <PanelContent />
    </Panel>
  </Collapse>;
};