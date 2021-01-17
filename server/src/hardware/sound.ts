import { exec } from '../utility/exec';
import { getSounds } from '../dao/soundsDao';

export const playSound = async (filename: string): Promise<{error?: Error, stderr?: string}> => {
  return exec(
    ` \
      amixer set Headphone on; \
      aplay "./sounds/${filename}"; \
      amixer set Headphone off; \
    `
  );
};

export const playBeep = async (repeat: number): Promise<void> => {
  try {
    await exec('amixer set Headphone on');

    const sounds = await getSounds();
    for (let i = 0; i < repeat; i++) {
      await exec(`aplay "./sounds/${sounds.beep}"`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }  
  } finally {
    await exec('amixer set Headphone off');
  }
};

(async () => {
  const result = await playSound((await getSounds())[process.env.STARTUP_SOUND || 'appear']);
  if (result.error) {
    console.error(result.stderr);
  }
})();
