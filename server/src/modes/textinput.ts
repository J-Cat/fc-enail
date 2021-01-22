import { Color, Font, Ioledjs, Layer } from 'ssd1306-i2c-js';
import { drawStringWrapped } from '../hardware/display';
import { setEncoderValue } from '../hardware/rotaryEncoder';
import { Constants } from '../models/Constants';
import { registerStateChange, setSharedState } from '../dao/sharedState';
import { getMenuUpdate } from './menu';

let state = registerStateChange('text-input', async (oldState, newState): Promise<void> => {
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

export const useTextInputEncoderLongClick = async (): Promise<boolean> => {
  if (state.textinput) {
    setSharedState({
      textinput: undefined,
      menu: getMenuUpdate({ action: undefined }),
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

let flashState = false;
export const renderTextInput = (display: Ioledjs): void => {
  const menu = state.menu?.[state.menu?.length-1];
  const label = menu?.action || ' ';
  display.setFont(Font.UbuntuMono_8ptFontInfo);
  display.drawString(0, 0, label, 1, Color.White, Layer.Layer0);
  display.drawString(
    0, 11, 
    `${state.textinput?.text}${flashState === true ? '_' : ' '}${'_'.repeat(128-(state.textinput?.text?.length || 0))}`, 
    1, Color.White, Layer.Layer0
  );

  const lines = Constants.textInput[state.textinput?.inputMode || 'lowercase'];
  const lineLength = Math.ceil(lines.length / 2);
  const startX = 6;

  drawStringWrapped(
    startX, 29, 
    lines,
    Font.UbuntuMono_8ptFontInfo, 
    0, 
    lineLength * 6,
    11
  );
  const charPos = lines.indexOf(state.textinput?.activeChar || '--');
  if (charPos >= 0) {
    const x = startX + (charPos * 6) - (charPos > lineLength ? (lineLength * 6) : 0);
    const y = 29 + (charPos >= lineLength ? 10 : 0);
    display.drawRect(x-1, y-1, 8, 12, Color.White, Layer.Layer0);
  }
  
  if (state.textinput?.activeChar === 'mode') {
    display.fillRect(0, 55, 36, 10, Color.White, Layer.Layer0);
  }
  display.drawString(
    0, 55, 
    state.textinput?.inputMode === 'lowercase' 
      ? 'upper'
      : state.textinput?.inputMode === 'uppercase'
        ? 'symbol'
        : 'lower', 
    1,
    state.textinput?.activeChar === 'mode' ? Color.Inverse : Color.White, 
    Layer.Layer0
  );

  if (state.textinput?.activeChar === 'del') {
    display.fillRect(38, 55, 18, 10, Color.White, Layer.Layer0);
  }
  display.drawString(38, 55, 'Del', 1, state.textinput?.activeChar === 'del' ? Color.Inverse : Color.White, Layer.Layer0);
  if (state.textinput?.activeChar === 'cancel') {
    display.fillRect(64, 55, 36, 10, Color.White, Layer.Layer0);
  }
  display.drawString(64, 55, 'Cancel', 1, state.textinput?.activeChar === 'cancel' ? Color.Inverse : Color.White, Layer.Layer0);
  if (state.textinput?.activeChar === 'ok') {
    display.fillRect(108, 55, 12, 10, Color.White, Layer.Layer0);
  }
  display.drawString(108, 55, 'Ok', 1, state.textinput?.activeChar === 'ok' ? Color.Inverse : Color.White, Layer.Layer0);
  display.refresh();
  flashState = !flashState;
};