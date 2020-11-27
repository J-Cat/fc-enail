import { Color, Font, Ioledjs, Layer } from 'ssd1306-i2c-js';
import { fontSize, getWrappedLines } from '../hardware/display';
import { registerStateChange, setSharedState } from '../dao/sharedState';

let state = registerStateChange('prompt-input',async (oldState, newState): Promise<void> => {
  state = newState;
});

export const usePromptClick = async (): Promise<boolean> => {
  if (state.prompt) {
    if (state.prompt.current) {
      await state.prompt.onOk();
    }
    setSharedState({
      prompt: undefined,
    });
    return true;
  }
  return false;
};

export const usePromptEncoderClick = async (): Promise<boolean> => {
  if (state.prompt) {
    setSharedState({
      prompt: undefined,
    });
    return true;
  }
  return false;
};

export const usePromptEncoderChange = async (): Promise<boolean> => {
  if (state.prompt) {
    setSharedState({
      prompt: {
        ...state.prompt,
        current: !state.prompt.current,
      },
    });
    return true;
  }
  return false;
};

export const setPromptInput = async (text: string, onOk: () => Promise<void>): Promise<void> => {
  await setSharedState({ 
    prompt: {
      text,
      current: true,
      onOk,
    },
  }); 
};

export const renderPrompt = (display: Ioledjs): void => {
  if (!state.prompt?.text) {
    return;
  }

  const [fontWidth, fontHeight] = fontSize(Font.UbuntuMono_10ptFontInfo);
  const [maxWidth, lines] = getWrappedLines(state.prompt?.text, Font.UbuntuMono_10ptFontInfo);
  
  const x = Math.floor((128 - (maxWidth * fontWidth))/2);
  let y = Math.floor((64 - (fontHeight * (lines.length + 2)))/2);
  let linePos = 0;
  for (const line of lines) {
    display.drawString(x, y + (linePos++ * fontHeight), line, 1, Color.White, Layer.Layer0);
  }
  y = y + (++linePos * fontHeight);
  const spaces = Math.max(Math.floor((maxWidth - 11)/2), 0);
  if (state.prompt.current) {
    display.fillRect(x+((spaces+9)*fontWidth), y, fontWidth * 2, fontHeight, Color.White, Layer.Layer0);
    display.drawString(x+(spaces*fontWidth), y, 'Cancel', 1, Color.White, Layer.Layer0);
    display.drawString(x+((spaces+9)*fontWidth), y, 'Ok', 1, Color.Black, Layer.Layer0);
  } else {
    display.fillRect(x+(spaces*fontWidth), y, fontWidth * 6, fontHeight, Color.White, Layer.Layer0);
    display.drawString(x+(spaces*fontWidth), y, 'Cancel', 1, Color.Black, Layer.Layer0);
    display.drawString(x+((spaces+9)*fontWidth), y, 'Ok', 1, Color.White, Layer.Layer0);
  }
  display.refresh();
};
