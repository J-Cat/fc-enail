import Lowdb, { LowdbAsync } from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync'
import { Guid } from 'guid-typescript'

export interface IProfile {
  key: string;
  title: string;
  p: number;
  i: number;
  d: number;  
}

export interface ILocalDb {
  url?: string;
  quickSet: number[];
  profiles: IProfile[];
  currentProfile?: string;
}

const adapter = new FileAsync<ILocalDb>('./db.json', { 
  defaultValue: {
    quickSet: [465, 485, 495, 505, 510, 515, 530],
    profiles: [],
  },
});
let db: LowdbAsync<ILocalDb>;

(async () => {
  db = await Lowdb(adapter);
  if (!db.get('profiles')) {
    await db.set('profiles', []).write();
  }
})();

export const getUrl = (): string => {
  return db.get('url').value() || '';
}

export const setUrl = (url: string): Promise<void> => {
  return db.set('url', url).write();
}

export const getQuickSet = (): number[] => {
  return db.get('quickSet').value();
}

export const setQuickSet = (values: number[]): Promise<void> => {
  return db.set('quickSet', values).write();
}

export const getCurrentProfile = (): string => {
  return db.get('currentProfile').value();
}

export const setCurrentProfile = async (key: string): Promise<void> => {
  const profile = db.get('profiles').find(p => p.key === key);
  if (!profile) {
    throw new Error('Invalid profile specified.');
  }
  return db.set('currentProfile', key).write();
}

export const getProfile = (key: string): IProfile => {
  const profile = db.get('profiles').find(p => p.key === key);
  return profile?.value?.();
}

export const setProfile = async (profile: IProfile): Promise<IProfile> => {
  const existing = db.get('profiles').find(p => p.key === profile.key);
  if (existing.value()) {
    const p = await existing.assign(profile).write();
    return p;
  } else {
    const p = await db.get('profiles').push({ ...profile, key: Guid.create().toString() }).write();
    return p?.[0];
  }
}

export const getProfiles = (): IProfile[] => {
  return db.get('profiles').value();
}
