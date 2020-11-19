import { setEncoderValue } from '../hardware/rotaryEncoder';
import { Constants } from '../models/Constants';
import { registerStateChange, setSharedState } from '../utility/sharedState';
import { getMenuUpdate } from './menu';

let state = registerStateChange('text-input', (oldState, newState) => {
  state = newState;
});

export const useTextInputClick = async (): Promise<boolean> => {
  if (state.textinput) {
    await state.textinput.onOk?.(state.textinput.text);
    return true;
  }
  return false;
};

export const useTextInputEncoderClick = async (): Promise<boolean> => {
  if (state.textinput) {
    setSharedState({
      textinput: {
        ...state.textinput,
        inputMode: state.textinput?.inputMode === 'lowercase'
          ? 'uppercase'
          : state.textinput?.inputMode === 'uppercase'
            ? 'symbols'
            : 'lowercase',
      },
      //menu: getMenuUpdate({ action: undefined }),
    });
    return true;
  }
  return false;
};

export const useTextInputEncoderChange = async (increment: number): Promise<boolean> => {
  if (state.textinput) {
    const line = Constants.textInput[state.textinput?.inputMode || 'lowercase'];
    const max = line.length + 4;
    const charIndex = state.textinput.activeChar === 'mode'
      ? max - 3
      : state.textinput.activeChar === 'del'
        ? max - 2
        : state.textinput.activeChar === 'cancel'
          ? max - 1
          : state.textinput.activeChar === 'ok'
            ? max
            : line.indexOf(state.textinput?.activeChar);
    let newIndex = charIndex + increment;
    if (newIndex < 0) {
      newIndex = max + newIndex;
    }
    let newChar = state.textinput.activeChar;
    if (newIndex === max - 3) {
      newChar = 'mode';
    } else if (newIndex === max - 2) {
      newChar = 'del';
    } else if (newIndex === max - 1) {
      newChar = 'cancel';
    } else if (newIndex === max) {
      newChar = 'ok';
    } else {
      newChar = line.charAt(newIndex);
    }
    setSharedState({
      textinput: {
        ...state.textinput,
        activeChar: newChar,
      },
    });
    setEncoderValue(0, false);
    return true;
  }  
  return false;
};

export const processTextInput = async (): Promise<boolean> => {
  if (!state.textinput) {
    return false;
  }

  switch (state.textinput.activeChar) {
  case 'mode': {
    setSharedState({
      textinput: {
        ...state.textinput,
        inputMode: state.textinput.inputMode === 'lowercase' ? 'uppercase' : state.textinput.inputMode === 'uppercase' ? 'symbols' : 'lowercase',
      },
    });
    return true;
  }
  case 'del': {
    setSharedState({
      textinput: {
        ...state.textinput,
        text: state.textinput.text.substr(0, state.textinput.text.length-1),
      },
    });
    return true;
  }
  case 'cancel': {
    setSharedState({
      textinput: undefined,
      menu: getMenuUpdate({ action: undefined }),
    });
    return true;
  }
  case 'ok': {
    await state.textinput.onOk?.(state.textinput.text);
    return true;
  }
  }

  setSharedState({
    textinput: {
      ...state.textinput,
      text: state.textinput.text + state.textinput.activeChar,
    },
  });
  return true;
};

export const setTextInput = (label: string, initialValue: string, callback: (text: string) => Promise<void>): void => {
  setSharedState({
    menu: getMenuUpdate({ action: label }),
    textinput: {
      text: initialValue,
      activeChar: 'a',
      inputMode: 'lowercase',
      onOk: async (text: string) => {
        await callback(text);
      }
    },
  });
};
