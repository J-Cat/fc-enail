import { IE5ccState } from '../hardware/e5cc';
import { Lock } from './Lock';

const lock = new Lock();

export interface ISharedState extends IE5ccState {
  passcode?: string;
}

let state: ISharedState | undefined;
let lastState: ISharedState | undefined;

let onChange: (lastState: ISharedState | undefined, state: ISharedState, source: 'e5cc'|'api') => void;

export const initSharedState = (
  onChangeFunc?: (lastState: ISharedState | undefined, state: ISharedState, source: 'e5cc'|'api') => void,
) => {
  if (onChangeFunc) {
    onChange = onChangeFunc;
  }
}
export const setSharedState = async (newState: ISharedState, source: 'e5cc'|'api' = 'api'): Promise<void> => {
  await lock.acquire();
  try {
    if (state) {
      lastState = {
        ...state,
      };  
    }
    state = {
      ...(state || {}),
      ...newState,
    };
    onChange?.(lastState, state, source);
  } finally {
    lock.release();
  }
}

export const getSharedState = async (): Promise<ISharedState|undefined> => {
  await lock.acquire();
  try {
    return state;
  } finally {
    lock.release();
  }
}