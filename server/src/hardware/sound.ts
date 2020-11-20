import { exec } from 'child_process';
import { Sounds } from '../models/sounds';

export const playSound = async (filename: string): Promise<{error?: Error, stderr?: string}> => {
  return new Promise(resolve => {
    exec(`aplay "./sounds/${filename}"`, (error, stdout, stderr) => {
      if (error) {
        resolve({
          error: new Error(error.message),
          stderr,
        });
      }
      resolve({});
    });
  });
};

export const playBeep = async (repeat: number): Promise<void> => {
  for (let i = 0; i < repeat; i++) {
    await playSound(Sounds.beep);
    await new Promise(resolve => setTimeout(resolve, 750));
  }
};

(async () => {
  const result = await playSound(Sounds.appear);
  if (result.error) {
    console.error(result.stderr);
  }
})();
