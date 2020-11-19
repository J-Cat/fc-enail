import { updateE5ccSetPoint } from '../hardware/e5cc';
import { setEncoderValue } from '../hardware/rotaryEncoder';
import { IModeInstance } from '../models/IModeInstance';
import { registerStateChange, setNextMode, setSharedState } from '../utility/sharedState';

let state = registerStateChange('mode-home', (oldState, newState) => {
  state = newState;
  if ((oldState?.mode !== newState.mode) && (newState.mode === 'home') && (newState.sp)) {
    setEncoderValue(newState.sp);
  }
});

export const HomeMode: IModeInstance = {
  key: 'home',
  onClick: async (): Promise<void> => {
    await setSharedState({ running: !state.running });          
  },
  onEncoderClick: async (): Promise<void> => {
    setNextMode('self');
    setEncoderValue(0, false);
  },
  onEncoderChange: async (value: number): Promise<void> => {
    if (value === state.sp) {
      return;
    }

    const newValue = await updateE5ccSetPoint(value);
    if (newValue !== value) {
      setEncoderValue(newValue);
    }
  },
};