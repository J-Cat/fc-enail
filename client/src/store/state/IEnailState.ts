export interface IE5ccState {
  readonly sp?: number;
  readonly pv?: number;
  readonly running?: boolean;
  readonly tuning?: boolean;
  readonly nocoil?: boolean;
  readonly started?: number;
  readonly scriptRunning?: boolean;
  readonly scriptFeedback?: IScriptFeedback;
}

export interface IScriptFeedback {
  start: number;
  text?: string;
  icon?: string;
}

export interface IConfig {
  readonly autoShutoff: number;
  readonly screenSaverTimeout: number;
  readonly screenOffTimeout: number;
  readonly max: number;
  readonly min: number;
  readonly localtunnel: string;
}

export interface ISharedState extends IE5ccState {
  rebooting?: boolean;
  url?: string;
}

export interface IEnailState {
  loading: boolean;
  requesting: boolean;
  loaded: boolean;
  state?: ISharedState; 
  config?: IConfig;
  quickset: number[];
  error?: string;
}