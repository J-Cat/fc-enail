export interface IScript {
  key: string;
  title: string;
  rootStep: ISequentialStep;
}

export enum StepTypeEnum {
  SequentialStep,
  UpdateSetPointStep,
  FeedbackStep,
  TimerStep,
  WaitForSetPointStep,
}
export interface IStep {
  key: string;
  type: StepTypeEnum;
}

export interface ISequentialStep extends IStep {
  loop: number;
  steps: IStep[];
}

export interface IUpdateSetPointStep extends IStep {
  updateType: 'increment'|'fixed';
  value: number;
}

export interface IFeedbackStep extends IStep {
  icon?: string;
  sound?: string;
  text?: string;
}

export interface ITimerStep extends IStep {
  duration: number;
}

export interface IWaitForSetPointStep extends IStep {
  timeout: number;
}

export type StepType = ISequentialStep | IUpdateSetPointStep | IFeedbackStep | ITimerStep | IWaitForSetPointStep;
