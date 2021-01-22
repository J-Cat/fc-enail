import { Color, Font, Ioledjs, Layer } from 'ssd1306-i2c-js';
import { fontSize } from '../hardware/display';
import { setEncoderValue } from '../hardware/rotaryEncoder';
import { registerStateChange, setSharedState } from '../dao/sharedState';
import { getMenuUpdate } from './menu';

let state = registerStateChange('number-input', async (oldState, newState): Promise<void> => {
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
      },
    },
  });
};

export const renderNumberInput = (display: Ioledjs): void => {
  if (state.numberinput?.value === undefined) {
    return;
  }

  const menu = state.menu?.[state.menu?.length-1];
  const label = menu?.action || ' ';

  display.setFont(Font.UbuntuMono_10ptFontInfo);
  const [labelFontWidth] = fontSize(Font.UbuntuMono_10ptFontInfo);
  const labelX = Math.floor((128 - (label.length * labelFontWidth)) / 2);
  display.drawString(labelX, 16, label, 1, Color.White, Layer.Layer0);

  display.setFont(Font.UbuntuMono_16ptFontInfo);
  const [fontWidth] = fontSize(Font.UbuntuMono_16ptFontInfo);
  const width = state.numberinput?.value.toString().length * fontWidth;
  if (width === 0) {
    return;
  }

  const x = Math.floor((128 - width) / 2);
  display.drawString(x, 29, state.numberinput?.value.toString(), 1, Color.White, Layer.Layer0);  
  display.refresh();
};
