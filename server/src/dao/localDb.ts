import Lowdb, { LowdbAsync } from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';
import { Guid } from 'guid-typescript';
import { IUpdateSetPointStep, IFeedbackStep, ITimerStep, IWaitForSetPointStep, IScript, StepTypeEnum } from '../models/IScript';

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
  scripts: IScript[];
  currentProfile?: string;
  currentScript?: string;
  ssids: string[];
}

const defaultValue = {
  quickSet: [465, 485, 495, 505, 510, 515, 530],
  profiles: [],
  ssids: [],
  scripts: [{
    key: Guid.create().toString(),
    title: 'Up-Temp 40',
    rootStep: {
      key: Guid.create().toString(),
      type: StepTypeEnum.SequentialStep,
      loop: 1,
      steps: [
        {
          key: Guid.create().toString(),
          type: StepTypeEnum.FeedbackStep,
          icon: 'drop',
          sound: 'organ.wav',
        } as IFeedbackStep,
        {
          key: Guid.create().toString(),
          type: StepTypeEnum.UpdateSetPointStep,
          updateType: 'increment',
          value: 40,
        } as IUpdateSetPointStep,
        {
          key: Guid.create().toString(),
          type: StepTypeEnum.WaitForSetPointStep,
        } as IWaitForSetPointStep,
        {
          key: Guid.create().toString(),
          type: StepTypeEnum.FeedbackStep,
          icon: 'cloud',
          sound: 'organ.wav',
        } as IFeedbackStep,
        {
          key: Guid.create().toString(),
          type: StepTypeEnum.TimerStep,
          duration: 5,
        } as ITimerStep,
        {
          key: Guid.create().toString(),
          type: StepTypeEnum.UpdateSetPointStep,
          updateType: 'increment',
          value: -40,
        } as IUpdateSetPointStep,
        {
          key: Guid.create().toString(),
          type: StepTypeEnum.WaitForSetPointStep
        } as IWaitForSetPointStep,
        {
          key: Guid.create().toString(),
          type: StepTypeEnum.FeedbackStep,
          icon: 'drop',
        } as IFeedbackStep,
        {
          key: Guid.create().toString(),
          type: StepTypeEnum.TimerStep,
          duration: 3,
        } as ITimerStep,
      ],
    },
  }],
};

const adapter = new FileAsync<ILocalDb>('./db.json', { defaultValue });
let db: LowdbAsync<ILocalDb>;

export const initLocalDb = async (): Promise<void> => {
  db = await Lowdb(adapter);
  if (!db.get('profiles')) {
    await db.set('profiles', []).write();
  }
  if (!(db.get('scripts').value())) {
    await db.set('scripts', defaultValue.scripts).write();
  }
};

export const getUrl = (): string => {
  return db.get('url').value() || '';
};

export const setUrl = (url: string): Promise<void> => {
  return db.set('url', url).write();
};

export const getQuickSet = (): number[] => {
  return db.get('quickSet').value();
};

export const setQuickSet = (values: number[]): Promise<void> => {
  return db.set('quickSet', values).write();
};

export const getCurrentProfile = (): string => {
  return db.get('currentProfile').value();
};

export const setCurrentProfile = async (key: string): Promise<void> => {
  const profile = db.get('profiles').find(p => p.key === key);
  if (!profile) {
    throw new Error('Invalid profile specified.');
  }
  return db.set('currentProfile', key).write();
};

export const getProfile = (key: string): { index?: number; profile?: IProfile } => {
  const profiles = db.get('profiles').value();
  let index = profiles.findIndex(p => p.key === key);
  if (index < 0 && profiles.length > 0) {
    index = 0;
  }
  if (index < 0) {
    return {};
  }
  return { index, profile: profiles[index] };
};

export const setProfile = async (profile: IProfile): Promise<IProfile> => {
  const existing = db.get('profiles').find(p => p.key === profile.key);
  if (existing.value()) {
    const p = await existing.assign(profile).write();
    return p;
  } else {
    const p = { ...profile, key: Guid.create().toString() };
    await db.get('profiles').push(p).write();
    return p;
  }  
};

export const deleteProfile = async (key: string): Promise<void> => {
  const profile = db.get('profiles').find(p => p.key === key);
  if (!profile) {
    throw new Error('Invalid profile specified.');
  }
  await db.get('profiles').remove(p => p.key === key).write();
  return;
};

export const getProfiles = (): IProfile[] => {
  return db.get('profiles').sort((a, b) => a.title.localeCompare(b.title)).value();
};

export const getSsids = (): string[] => {
  return db.get('ssids').value();
};

export const setSsids = (ssids: string[]): Promise<void> => {
  return db.set('ssids', ssids).write();
};

export const getScripts = (): IScript[] => {
  return db.get('scripts').sort((a, b) => a.title.localeCompare(b.title)).value();
};

export const getScript = (key: string): { index: number; script: IScript } => {
  const scripts = db.get('scripts').value();
  const index = scripts.findIndex(s => s.key === key);
  return { index, script: scripts[index] };
};

export const setScript = async (script: IScript): Promise<IScript> => {
  const existing = db.get('scripts').find(s => s.key === script.key);
  if (existing.value()) {
    const s = await existing.assign(script).write();
    return s;
  } else {
    const s = { ...script, key: Guid.create().toString() };
    await db.get('scripts').push(s).write();
    return s;
  }  
};

export const deleteScript = async (key: string): Promise<void> => {
  const script = db.get('scripts').find(s => s.key === key);
  if (!script) {
    throw new Error('Invalid script specified.');
  }
  await db.get('scripts').remove(s => s.key === key).write();
  return;
};

export const getCurrentScript = (): string => {
  const key = db.get('currentScript').value();
  if (key) {
    return key;
  }
  const scripts = db.get('scripts').value();
  return scripts?.[0].key;
};

export const setCurrentScript = async (key: string): Promise<void> => {
  const script = db.get('scripts').find(p => p.key === key);
  if (!script) {
    throw new Error('Invalid script specified.');
  }
  return db.set('currentScript', key).write();
};
