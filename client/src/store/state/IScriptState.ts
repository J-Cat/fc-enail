import { IScript } from '../../models/IScript';

export interface IScriptState {
  loading: boolean;
  requesting: boolean;
  loaded: boolean;
  currentScript?: string; 
  scripts: IScript[];
  error?: string;
}