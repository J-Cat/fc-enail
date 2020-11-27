import { toggleTuning } from '../dao/profilesDao';
import { setEncoderValue } from '../hardware/rotaryEncoder';
import { IModeInstance } from '../models/IModeInstance';
import { getCurrentScript, getQuickSet, getScript } from '../dao/localDb';
import { registerStateChange, setNextMode, setSharedState } from '../dao/sharedState';
import { runScript } from '../utility/scriptEngine';

let presets: number[] = [];

let state = registerStateChange('mode-presets', async (oldState, newState): Promise<void> => {
  state = newState;
  if ((oldState?.mode !== newState.mode) && (newState.mode === 'presets') && (newState.sp)) {
    setEncoderValue(newState.sp);
    presets = getQuickSet();
    const currentPresetValue = presets.reduce((previous, value) => {
      const sp = state.sp || 0;
      if (Math.abs(sp - value) < Math.abs(sp - previous)) {
        return value;
      }
      return previous;
    }, 100000);

    await setSharedState({
      currentPreset: presets.findIndex(p => p === currentPresetValue),
    });
  }
});

export const PresetsMode: IModeInstance = {
  key: 'presets',
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

    let newPos = (state.currentPreset || 0) + value;
    if (newPos > presets.length - 1) {
      newPos = presets.length - 1;
    } else if (newPos < 0) {
      newPos = 0;
    }
    setSharedState({
      currentPreset: newPos,
    });
    setEncoderValue(0, false);
  },
};