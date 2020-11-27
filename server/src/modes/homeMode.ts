import { toggleTuning } from '../dao/profilesDao';
import { updateE5ccSetPoint } from '../hardware/e5cc';
import { setEncoderValue } from '../hardware/rotaryEncoder';
import { IModeInstance } from '../models/IModeInstance';
import { getCurrentScript, getScript } from '../dao/localDb';
import { registerStateChange, setNextMode, setSharedState } from '../dao/sharedState';
import { runScript } from '../utility/scriptEngine';

let state = registerStateChange('mode-home', async (oldState, newState): Promise<void> => {
  state = newState;
  if ((oldState?.mode !== newState.mode) && (newState.mode === 'home') && (newState.sp)) {
    setEncoderValue(newState.sp);
  }
});

export const HomeMode: IModeInstance = {
  key: 'home',
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
    await setSharedState({ running: !state.running });          
  },
  onLongClick: async (): Promise<void> => {
    if (state.scriptRunning || state.tuning) {
      return;
    }

    const key = getCurrentScript();
    const { script } = getScript(key);
    runScript(script);
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
    setNextMode('self');
    setEncoderValue(0, false);
  },
  onEncoderChange: async (value: number): Promise<void> => {
    if (state.scriptRunning || state.tuning) {
      return;
    }

    if (value === state.sp) {
      return;
    }

    const newValue = await updateE5ccSetPoint(value);
    if (newValue !== value) {
      setEncoderValue(newValue);
    }
  },
};