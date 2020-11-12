export interface IE5ccState {
  readonly sp?: number;
  readonly pv?: number;
  readonly running?: boolean;
  readonly tuning?: boolean;
  readonly nocoil?: boolean;
  readonly started?: number;
}

export interface ISharedState extends IE5ccState {
  rebooting?: boolean;
  url?: string;
}

export interface IEnailState {
  loading: boolean;
  loaded: boolean;
  state?: ISharedState; 
  error?: string;
}