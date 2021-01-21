import { exec } from '../utility/exec';
import { getSounds } from '../dao/soundsDao';
import { Gpio } from 'pigpio';
import { parseIntDefault } from '../utility/parseIntDefault';
import { getVolume } from '../dao/configDao';

let volume: number;
export const updateVolumeState = (value: number): void => {
  volume = value; 
};

let gpio: Gpio;
export const initSound = async (): Promise<void> => {
  gpio = new Gpio(parseIntDefault(process.env.AUDIO_MUTE_PIN, 16), { mode: Gpio.OUTPUT });
  gpio.digitalWrite(0);

  volume = await getVolume();

  const result = await playSound((await getSounds())[process.env.STARTUP_SOUND || 'appear']);
  if (result.error) {
    console.error(result.stderr);
  }
};

export const playSound = async (filename: string): Promise<{error?: Error, stderr?: string}> => {
  if (volume === 0) {
    return {};
  }

  gpio?.digitalWrite(1);
  try {
    const result = await exec(
      ` \
        amixer set Headphone on; \
        aplay "./sounds/${filename}"; \
        amixer set Headphone off; \
      `
    );
    return result;
  } finally {
    gpio?.digitalWrite(0);      
  }
};

export const playBeep = async (repeat: number): Promise<void> => {
  try {
    if (volume === 0) {
      return;
    }

    await exec('amixer set Headphone on');

    const sounds = await getSounds();
    for (let i = 0; i < repeat; i++) {
      gpio?.digitalWrite(1);
      await exec(`aplay "./sounds/${sounds.beep}"`);
      gpio.digitalWrite(0);
      await new Promise(resolve => setTimeout(resolve, 500));
    }  
  } finally {
    gpio.digitalWrite(0);
    await exec('amixer set Headphone off');
  }
};
