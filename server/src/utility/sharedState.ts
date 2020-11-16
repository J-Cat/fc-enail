import { IE5ccState } from '../hardware/e5cc';
import { Lock } from './Lock';

export type ChangeFunc = (lastState: ISharedState | undefined, state: ISharedState, source: 'e5cc'|'api'|'self') => void;

const onChanges: { 
  [key: string]: ChangeFunc
} = {};

const lock = new Lock();
export interface IMenu {
  current: number;
  min: number;
  max: number;
  action?: string;
  menuItems: string[];
  onClick: (index: number, action?: string) => void;
}

export interface IMode {
  key: string;
  onClick: () => Promise<void>;
  onEncoderClick: () => Promise<void>;
  onEncoderChange: (increment: number) => Promise<void>;
  onLongClick?: () => Promise<void>;
  onReallyLongClick?: () => Promise<void>;
  onReallyReallyLongClick?: () => Promise<void>;
}

export interface ISharedState extends IE5ccState {
  passcode?: string;
  rebooting?: boolean;
  url?: string;
  mode?: string,
  menu?: IMenu[];
  loading?: boolean;
  loadingMessage?: string;
  modes?: {
    [mode: string]: IMode;
  };
  textinput?: {
    text: string;
    activeChar: string;
    inputMode: 'lowercase' | 'uppercase' | 'symbols';
  };
}

let state: ISharedState = { menu: [], loading: false, };
let lastState: ISharedState = { menu: [], loading: false, };

export const setNextMode = (source: 'e5cc'|'api'|'self') => {
  const keys = Object.keys(state.modes || []);
  const index = keys.findIndex(key => key === state.mode);
  let newIndex = 0;
  if (index < keys.length - 1) {
    newIndex = index + 1;
  } else {
    newIndex = 0;
  }
  setSharedState({ mode: keys[newIndex] }, source);
}

export const registerStateChange = (
  key: string,
  onChange: (lastState: ISharedState | undefined, state: ISharedState, source: 'e5cc'|'api'|'self') => void | Promise<void>,
) => {
  onChanges[key] = onChange;
}

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
}

export const getSharedState = async (): Promise<ISharedState|undefined> => {
  await lock.acquire();
  try {
    return state;
  } finally {
    lock.release();
  }
}