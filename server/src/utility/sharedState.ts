import { IE5ccState } from '../hardware/e5cc';
import { IIcon } from '../models/icons';
import { Lock } from './Lock';

export type ChangeFunc = (lastState: ISharedState | undefined, state: ISharedState, source: 'e5cc'|'api'|'self') => Promise<void>;

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
  icon?: IIcon;
  isMoving?: boolean;
  onClick: (index: number, action?: string) => Promise<void>;
  onLongClick?: (index: number) => Promise<void>;
  onMove?: () => Promise<void>;
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

export interface IScriptFeedback {
  start: number;
  text?: string;
  icon?: string;
}

export interface ISharedState extends IE5ccState {
  passcode?: string;
  rebooting?: boolean;
  cancel?: boolean;
  url?: string;
  mode?: string,
  menu?: IMenu[];
  menus?: IMenu[][];
  loading?: boolean;
  loadingMessage?: string;
  modes?: {
    [mode: string]: IMode;
  };
  currentPreset?: number;
  currentProfile?: number;
  currentScript?: number;
  textinput?: {
    text: string;
    activeChar: string;
    inputMode: 'lowercase' | 'uppercase' | 'symbols';
    onOk?: (text: string) => Promise<void>;
  };
  numberinput?: {
    value: number;
    min: number;
    max: number;
    step: number;
    onClick?: (value: number) => Promise<void>;
  }
  prompt?: {
    text: string;
    current: boolean;
    onOk: () => Promise<void>;
  },
  scriptRunning?: boolean;
  scriptFeedback?: IScriptFeedback;
}

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