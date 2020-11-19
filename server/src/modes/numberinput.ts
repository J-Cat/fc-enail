import { setEncoderValue } from '../hardware/rotaryEncoder';
import { registerStateChange, setSharedState } from '../utility/sharedState';
import { getMenuUpdate } from './menu';

let state = registerStateChange('number-input', (oldState, newState) => {
  state = newState;
});

export const useNumberInputClick = async (): Promise<boolean> => {
  if (state.numberinput) {
    state.numberinput.onClick?.(state.numberinput.value);
    return true;
  }
  return false;
};

export const useNumberInputEncoderClick = async (): Promise<boolean> => {
  if (state.numberinput) {
    setSharedState({
      numberinput: undefined,
      menu: getMenuUpdate({ action: undefined }),
    });
    return true;
  }
  return false;
};

export const useNumberInputEncoderChange = async (increment: number): Promise<boolean> => {
  if (state.numberinput) {
    setSharedState({
      numberinput: {
        ...state.numberinput,
        value: increment,
      }
    });
    return true;
  }
  return false;
};

export const processNumberInput = async (): Promise<boolean> => {
  if (state.numberinput) {
    await state.numberinput.onClick?.(state.numberinput.value);
    setSharedState({
      menu: getMenuUpdate({ action: undefined }),
      numberinput: undefined,
    });
    return true;
  }
  return false;
};

export const setNumberInput = (label: string, min: number, max: number, initialValue: number, callback: (value: number) => Promise<void>): void => {
  setEncoderValue(initialValue, true, min, max);
  setSharedState({
    menu: getMenuUpdate({ action: label }),
    numberinput: {
      value: initialValue,
      min,
      max,
      step: 1,
      onClick: async (value: number) => {
        await callback(value);
      }
    },
  });
};