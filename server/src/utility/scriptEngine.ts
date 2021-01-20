import { Font, Ioledjs } from 'ssd1306-i2c-js';
import { drawMessage, showMessage } from '../hardware/display';
import { playSound } from '../hardware/sound';
import { getTimeString } from './getTimeString';
import { IScript, IStep, StepTypeEnum, ISequentialStep, IUpdateSetPointStep, ITimerStep, IFeedbackStep, IWaitForSetPointStep } from '../models/IScript';
import { setCurrentScript } from '../dao/scriptsDao';
import { registerStateChange, setSharedState } from '../dao/sharedState';

let direction: 'up'|'down' = 'up';

let state = registerStateChange('script-engine', async (oldState, newState): Promise<void> => {
  state = newState;
});

export const runScript = async (script: IScript): Promise<void> => {
  //
  const startingSetPoint = state.sp;
  const menus = [...state.menu || []];
  menus.pop();
  await setCurrentScript(script.key);
  await setSharedState({
    menu: [
      ...menus,
    ],
    scriptRunning: true,
    scriptFeedback: {
      start: Date.now(),
      text: `Running ${script.title}`,
      icon: 'drop',
    },
  });
  await new Promise(resolve => setTimeout(resolve, 1000));
  await setSharedState({
    scriptFeedback: {
      ...state.scriptFeedback,
      text: undefined,
    } as { start: number; text?: string; icon?: string }
  });
  await runStep(script.rootStep);
  if (startingSetPoint) {
    await setSharedState({
      sp: startingSetPoint,
      scriptFeedback: {
        ...state.scriptFeedback,
        text: undefined,
      } as { start: number; text?: string; icon?: string },
    });
    await playSound('appear.wav');
    await showMessage('Script complete.');
    await setSharedState({
      scriptFeedback: undefined,
      scriptRunning: false,
    });
  }
};

export const runStep = async (step: IStep): Promise<void> => {
  if (!state.scriptRunning) {
    // console.log('Script cancelled');
    showMessage('Script cancelled');
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  switch (step.type) {
  case StepTypeEnum.SequentialStep: {
    await runSequentialStep(step as ISequentialStep);
    break;
  }
  case StepTypeEnum.UpdateSetPointStep: {
    await runUpdateSetPointStep(step as IUpdateSetPointStep);
    break;
  }
  case StepTypeEnum.WaitForSetPointStep: {
    const typedStep = step as IWaitForSetPointStep;
    const waitStart = Date.now();

    await new Promise<void>(resolve => {
      const checkSetPoint = async (): Promise<boolean> => {
        if (!state.pv || !state.sp) {
          return false;
        }

        if (typedStep.timeout && ((Date.now() - waitStart) > (typedStep.timeout * 1000))) {
          return true;
        }
        if ((direction === 'up') && ((state.pv + typedStep.offset) >= state.sp)) {
          return true;
        } else if ((direction === 'down') && ((state.pv - typedStep.offset) <= state.sp)) {
          return true;
        }

        return false;
      };

      const checkSetPointTimer = async (): Promise<void> => {
        if (await checkSetPoint()) {
          resolve();
        }

        if (!state.scriptRunning) {
          resolve();
        }
        setTimeout(checkSetPointTimer, 1000);
      };

      checkSetPointTimer();
    });
    break;
  }
  case StepTypeEnum.TimerStep: {
    await new Promise(resolve => setTimeout(resolve, (step as ITimerStep).duration * 1000));
    break;
  }
  case StepTypeEnum.FeedbackStep: {
    await runFeedbackStep(step);
    break;
  }
  }
};

export const runSequentialStep = async (sequential: ISequentialStep): Promise<void> => {
  for (const step of sequential.steps) {
    if (!state.scriptRunning) {
      return;
    }
    await runStep(step);
  }
};

export const runUpdateSetPointStep = async (step: IUpdateSetPointStep): Promise<void> => {
  if (step.updateType === 'fixed') {
    if (step.value > (state.sp || 0)) {
      direction = 'up';
    } else {
      direction = 'down';
    }
    await setSharedState({
      sp: step.value,
    });
    return;
  }
  if (step.value > 0) {
    direction = 'up';
  } else {
    direction = 'down';
  }
  await setSharedState({
    sp: step.value + (state.sp || 0)
  });
};

export const runFeedbackStep = async (step: IFeedbackStep): Promise<void> => {
  await setSharedState({
    scriptFeedback: {
      ...state.scriptFeedback,
      ...(step.text ? { text: step.text } : {}),
      ...(step.icon ? { icon: step.icon } : {}),
    } as { start: number, text: string; icon?: string },
  });
  if (step.sound) {
    await playSound(step.sound);
  }
  if (step.text) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await setSharedState({
      scriptFeedback: {
        ...state.scriptFeedback,
        text: undefined,
      } as { start: number, text?: string, icon?: string }
    });
  }
};

export const renderRunningScript = async (display: Ioledjs): Promise<void> => {
  display.clearScreen();
  const text = state.scriptFeedback?.text
    || (state.scriptFeedback?.start ? `Elapsed: ${getTimeString(Date.now() - state.scriptFeedback?.start)}` : '');
  await drawMessage(text, Font.UbuntuMono_10ptFontInfo, state.scriptFeedback?.icon);
  display.refresh();
};
