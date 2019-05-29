import { IStep } from './IStep';
import { IWaitTempStep } from './IWatiTempStep';
import { ITimerStep } from './ITimerStep';
import { IFeedbackStep } from './IFeedbackStep';
import { ILoopStep } from './ILoopStep';
import { IMoveTempStep } from './IMoveTempStep';
import { ISequentialStep } from './ISequentialStep';

export type Step = IStep | IWaitTempStep | ITimerStep | IFeedbackStep | ILoopStep | IMoveTempStep | ISequentialStep;