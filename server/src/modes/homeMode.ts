import { updateE5ccSetPoint } from '../hardware/e5cc';
import { setEncoderValue } from '../hardware/rotaryEncoder';
import { ISharedState, registerStateChange, setNextMode, setSharedState } from '../utility/sharedState';

let lastState: ISharedState | undefined;
let state: ISharedState;

registerStateChange('home-mode', (oldState, newState) => {
  lastState = oldState;
  state = newState;
  if ((oldState?.mode !== newState.mode) && (newState.mode === 'home') && (newState.sp)) {
    setEncoderValue(newState.sp);
  }
});

export const HomeMode = {
  key: 'home',
  onClick: async () => {
    console.log('click');
    await setSharedState({ running: !state.running });          
  },
  onEncoderClick: async () => {
    setNextMode('self');
    setEncoderValue(0, false);
  },
  onEncoderChange: async (value: number) => {
    if (value === state.sp) {
      return;
    }

    const newValue = await updateE5ccSetPoint(value);
    if (newValue !== value) {
      setEncoderValue(newValue);
    }
  },
};