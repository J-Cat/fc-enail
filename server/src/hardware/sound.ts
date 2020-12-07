import { exec } from 'child_process';
import { Sounds } from '../models/sounds';

export const playSound = async (filename: string): Promise<{error?: Error, stderr?: string}> => {
  return new Promise(resolve => {
    exec(
      ` \
        amixer set Headphone on; \
        aplay "./sounds/${filename}"; \
        amixer set Headphone off; \
      `, (error, stdout, stderr) => {
        if (error) {
          resolve({
            error: new Error(error.message),
            stderr,
          });
        }
        resolve({});
      },
    );
  });
};

export const playBeep = async (repeat: number): Promise<void> => {
  try {
    await new Promise(resolve => {
      exec('amixer set Headphone on', resolve);
    });

    for (let i = 0; i < repeat; i++) {
      await new Promise(resolve => {
        exec(`aplay "./sounds/${Sounds.beep}"`, resolve);
      });
      if (i > repeat - 1) {
        await new Promise(resolve => setTimeout(resolve, 750));
      }
    }  
  } finally {
    await new Promise(resolve => {
      exec('amixer set Headphone off', resolve);
    });
  }
};

(async () => {
  const result = await playSound(Sounds[process.env.STARTUP_SOUND || 'appear']);
  if (result.error) {
    console.error(result.stderr);
  }
})();
