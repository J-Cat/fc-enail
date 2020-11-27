import { IProfile } from './IProfile';
import { IScript } from './IScript';

export interface ILocalDb {
  url?: string;
  quickSet: number[];
  profiles: IProfile[];
  scripts: IScript[];
  currentProfile?: string;
  currentScript?: string;
  ssids: string[];
}
