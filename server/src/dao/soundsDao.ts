import { readdir, writeFile, rm } from 'fs/promises';
import { parse } from 'path';
import { IncludedSounds, ISounds } from '../models/ISounds';

let sounds: ISounds;

export const getSounds = async (forceRefresh = false): Promise<ISounds> => {
  if (!sounds || forceRefresh) {
    const files = await readdir('./sounds/', 'utf8');
    sounds = files.reduce((previous, file) => {
      const parsed = parse(file);
      return {
        ...previous,
        [parsed.name]: parsed.base,
      };
    }, {});
  }  
  return sounds;
};

export const uploadSound = async (name: string, file: Buffer): Promise<ISounds> => {
  if (IncludedSounds.findIndex(s => s.toLowerCase() === parse(name).name.toLowerCase()) >= 0) {
    throw new Error(`Cannot upload a sound by the same name as an included/default sound: ${name}`);
  }

  await writeFile(`./sounds/${name}`, file);

  return await getSounds(true);
};

export const deleteSound = async (key: string): Promise<ISounds> => {
  if (IncludedSounds.findIndex(s => s.toLowerCase() === parse(key).name.toLowerCase()) >= 0) {
    throw new Error(`Cannot delete an included/default sound: ${key}`);
  }

  await rm(`./sounds/${key}.wav`);

  return await getSounds(true);
};

