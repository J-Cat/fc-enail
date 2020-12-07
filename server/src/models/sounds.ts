
import { readdir } from 'fs/promises';
import { parse } from 'path';

let Sounds: { [key: string]: string };

export const getSounds = async (): Promise<{ [key: string]: string }> => {
  if (!Sounds) {
    const files = await readdir('./sounds/', 'utf8');
    Sounds = files.reduce((previous, file) => {
      const parsed = parse(file);
      return {
        ...previous,
        [parsed.name]: parsed.base,
      };
    }, {});
  }  
  return Sounds;
};

