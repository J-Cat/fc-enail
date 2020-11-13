export interface IE5ccState {
  readonly sp?: number;
  readonly pv?: number;
  readonly running?: boolean;
  readonly tuning?: boolean;
  readonly nocoil?: boolean;
  readonly started?: number;
}

export interface IConfig {
  readonly emailFrom?: string;
  readonly emailTo?: string;
  readonly autoShutoff: number;
  readonly screenSaverTimeout: number;
  readonly screenOffTimeout: number;
  readonly max: number;
  readonly min: number;
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
  error?: string;
}