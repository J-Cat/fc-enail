import { setEncoderValue } from '../hardware/rotaryEncoder';
import { IModeInstance } from '../models/IModeInstance';
import { getQuickSet } from '../utility/localDb';
import { registerStateChange, setNextMode, setSharedState } from '../utility/sharedState';

let presets: number[] = [];

let state = registerStateChange('mode-presets', (oldState, newState) => {
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

    setSharedState({
      currentPreset: presets.findIndex(p => p === currentPresetValue),
    });
  }
});

export const PresetsMode: IModeInstance = {
  key: 'presets',
  onClick: async (): Promise<void> => {
    await setSharedState({ running: !state.running });          
  },
  onEncoderClick: async (): Promise<void> => {
    setNextMode('self');
    setEncoderValue(0, false);
  },
  onEncoderChange: async (value: number): Promise<void> => {
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