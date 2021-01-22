import { ISharedState } from '../models/ISharedState';
import { Lock } from '../utility/Lock';

export type ChangeFunc = (lastState: ISharedState | undefined, state: ISharedState, source: 'e5cc'|'api'|'self') => Promise<void>;

const onChanges: { 
  [key: string]: ChangeFunc
} = {};

const lock = new Lock();

let state: ISharedState = { menu: [], loading: false, };
let lastState: ISharedState = { menu: [], loading: false, };

export const setNextMode = (source: 'e5cc'|'api'|'self'): void => {
  const keys = Object.keys(state.modes || []);
  const index = keys.findIndex(key => key === state.mode);
  let newIndex = 0;
  if (index < keys.length - 1) {
    newIndex = index + 1;
  } else {
    newIndex = 0;
  }
  setSharedState({ mode: keys[newIndex] }, source);
};

export const setPreviousMode = (source: 'e5cc'|'api'|'self'): void => {
  const keys = Object.keys(state.modes || []);
  const index = keys.findIndex(key => key === state.mode);
  let newIndex = 0;
  if (index > 0) {
    newIndex = index - 1;
  } else {
    newIndex = keys.length - 1;
  }
  setSharedState({ mode: keys[newIndex] }, source);
};

export const registerStateChange = (
  key: string,
  onChange: (lastState: ISharedState | undefined, state: ISharedState, source: 'e5cc'|'api'|'self') => Promise<void>,
): ISharedState => {
  onChanges[key] = onChange;
  return state;
};

export const setSharedState = async (newState: ISharedState, source: 'e5cc'|'api'|'self' = 'api'): Promise<{lastState: ISharedState, state: ISharedState}> => {
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
    for (const key of Object.keys(onChanges)) {
      onChanges[key]?.(lastState, state, source);
    }
    return { lastState, state };
  } finally {
    lock.release();
  }
};

export const getSharedState = async (): Promise<ISharedState|undefined> => {
  await lock.acquire();
  try {
    return state;
  } finally {
    lock.release();
  }
};