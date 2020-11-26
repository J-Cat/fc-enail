export interface IProfile {
  key: string;
  title: string;
  p: number;
  i: number;
  d: number;  
  offset: number;
}

export interface IProfileState {
  loading: boolean;
  requesting: boolean;
  loaded: boolean;
  currentProfile?: string; 
  profiles: IProfile[];
  newPid?: { p: number; i: number; d: number };
  error?: string;
}