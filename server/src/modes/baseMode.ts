import { toggleTuning } from '../dao/profilesDao';
import { setEncoderValue } from '../hardware/rotaryEncoder';
import { IModeInstance } from '../models/IModeInstance';
import { registerStateChange, setSharedState } from '../dao/sharedState';
import { useMenuClick, useMenuLongClick, useMenuEncoderClick, useMenuEncoderChange } from './menu';
import { processNumberInput, useNumberInputClick, useNumberInputEncoderChange, useNumberInputEncoderClick } from './numberinput';
import { usePromptClick, usePromptEncoderChange, usePromptEncoderClick } from './promptinput';
import { processTextInput, useTextInputClick, useTextInputEncoderChange, useTextInputEncoderClick } from './textinput';

let state = registerStateChange('mode-base', async (oldState, newState): Promise<void> => {
  state = newState;
  if ((oldState?.mode !== newState.mode) && (newState.mode === 'home') && (newState.sp)) {
    setEncoderValue(newState.sp);
  }
});

export const BaseMode: Partial<IModeInstance> = {
  onClick: async (): Promise<void> => {
    if (state.scriptRunning) {
      await setSharedState({
        scriptRunning: false,
        scriptFeedback: undefined,
      });
      return;
    }
    if (state.tuning) {
      await toggleTuning();
      return;
    }
    if (state.showMessage) {
      await setSharedState({
        showMessage: false,
      });
      return;
    }
    if (await usePromptClick()) {
      return;
    }
    if (await processTextInput()) {
      return;
    }
    if (await processNumberInput()) {
      return;
    }
    await useMenuClick();
  },
  onLongClick: async (): Promise<void> => {
    if (state.tuning || state.scriptRunning) {
      return;
    }
    if (await useNumberInputClick()) {
      return;
    }
    if (await useTextInputClick()) {
      return;
    }
    await useMenuLongClick();
  },
  onEncoderClick: async (): Promise<void> => {
    if (state.scriptRunning) {
      await setSharedState({
        scriptRunning: false,
        scriptFeedback: undefined,
      });
      return;
    }
    if (state.tuning) {
      await toggleTuning();
      return;
    }
    if (state.showMessage) {
      await setSharedState({
        showMessage: false,
      });
      return;
    }
    if (await usePromptEncoderClick()) {
      return;
    }
    if (await useTextInputEncoderClick()) {
      return;
    }
    if (await useNumberInputEncoderClick()) {
      return;
    }
    await useMenuEncoderClick();
  },
  onEncoderChange: async (value: number): Promise<void> => {
    if (state.tuning) {
      return;
    }
    if (await usePromptEncoderChange()) {
      return;
    }

    if (await useTextInputEncoderChange(value)) {
      return;
    }

    if (await useNumberInputEncoderChange(value)) {
      return;
    }

    await useMenuEncoderChange(value);
  },
};