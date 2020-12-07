
import { readdir } from 'fs/promises';
import { parse } from 'path';

let Sounds: { [key: string]: string } = {};
//   appear: 'appear.wav',
//   beep: 'beep.wav',
//   chime: 'chime.wav',
//   chime2: 'chinme2.wav',
//   organ: 'organ.wav',
//   complete: 'complete.wav',
//   disconnected: 'disconnected.wav',
//   money: 'money.wav',
//   buzzer: 'buzzer.wav',
// };

readdir('./sounds/', 'utf8').then(files => {
  Sounds = files.reduce((previous, file) => {
    const parsed = parse(file);
    return {
      ...previous,
      [parsed.name]: parsed.base,
    };
  }, {});
});

export { Sounds };

