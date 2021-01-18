import { IE5ccState } from '../models/IE5ccState';
import { IMenu } from './IMenu';
import { IMode } from './IMode';
import { IScriptFeedback } from './IScriptFeedback';

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
  showMessage?: boolean;
  scriptRunning?: boolean;
  scriptFeedback?: IScriptFeedback;
}
