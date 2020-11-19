import { registerStateChange, setSharedState } from '../utility/sharedState';

let state = registerStateChange('prompt-input', (oldState, newState) => {
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