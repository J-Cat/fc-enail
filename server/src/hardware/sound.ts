import { exec } from '../utility/exec';
import { getSounds } from '../dao/soundsDao';
import { Gpio } from 'pigpio';
import { parseIntDefault } from '../utility/parseIntDefault';

const gpio = new Gpio(parseIntDefault(process.env.AUDIO_MUTE_PIN, 16));
gpio.digitalWrite(0);

export const playSound = async (filename: string): Promise<{error?: Error, stderr?: string}> => {
  gpio.digitalWrite(1);
  try {
    return exec(
      ` \
        amixer set Headphone on; \
        aplay "./sounds/${filename}"; \
        amixer set Headphone off; \
      `
    );
  } finally {
    gpio.digitalWrite(0);
  }
};

export const playBeep = async (repeat: number): Promise<void> => {
  try {

    await exec('amixer set Headphone on');

    const sounds = await getSounds();
    for (let i = 0; i < repeat; i++) {
      gpio.digitalWrite(1);
      await exec(`aplay "./sounds/${sounds.beep}"`);
      gpio.digitalWrite(0);
      await new Promise(resolve => setTimeout(resolve, 500));
    }  
  } finally {
    gpio.digitalWrite(0);
    await exec('amixer set Headphone off');
  }
};

(async () => {
  const result = await playSound((await getSounds())[process.env.STARTUP_SOUND || 'appear']);
  if (result.error) {
    console.error(result.stderr);
  }
})();
