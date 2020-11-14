export interface IProfile {
  key: string;
  title: string;
  p: number;
  i: number;
  d: number;  
}

export interface IProfileState {
  loading: boolean;
  requesting: boolean;
  loaded: boolean;
  currentProfile?: string; 
  profiles: IProfile[];
  error?: string;
}