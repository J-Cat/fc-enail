import Lowdb, { LowdbAsync } from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync'

export interface ILocalDb {
  url?: string;
}

const adapter = new FileAsync<ILocalDb>('./db.json', { defaultValue: {} });
let db: LowdbAsync<ILocalDb>;

(async () => {
  db = await Lowdb(adapter); 
})();

export const setUrl = (url: string): Promise<void> => {
  return db.set('url', url).write();
}

export const getUrl = (): string => {
  return db.get('url').value() || '';
}