import { exec } from 'child_process';
import { readFile, stat, writeFile } from 'fs';
import { registerConfigChange, loadConfig } from '../config';
import { IConfig } from '../models/IConfig';

let Config = registerConfigChange('config-dao', newConfig => {
  Config = newConfig;
});

export const getConfig = async (): Promise<IConfig> => {
  const config = {
    autoShutoff: Config.e5cc.autoShutoff,
    screenSaverTimeout: Config.display.screenSaverTimeout,
    screenOffTimeout: Config.display.screenOffTimeout,
    max: Config.encoder.maxValue,
    min: Config.encoder.minValue,
    localtunnel: Config.localtunnel.subdomain,
    volume: await getVolume(),
    startupSound: Config.settings.startupSound,
  };

  return config;
};

export const saveConfig = async (config: IConfig): Promise<{ error?: string }> => {
  try {   
    const exists = await new Promise(resolve => stat('./.env', err => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    }));
    let newEnv = '';
    if (exists) {
      await new Promise<void>(resolve => readFile('./.env', { encoding: 'utf8' }, (err, data) => {
        if (!err) {
          const lines = data.split('\n');
          for (const line of lines) {
            if (!line?.trim()) {
              continue;
            }
            const [key] = line.split('=');
            if (
              [
                'E5CC_AUTOSHUTOFF', 'DISPLAY_SCREEN_SAVER', 'DISPLAY_SCREEN_OFF', 
                'ENCODER_MIN_VALUE', 'ENCODER_MAX_VALUE', 'LOCALTUNNEL_SUBDOMAIN',
                'STARTUP_SOUND',
              ].includes(key.trim())
            ) {
              continue;
            }
            newEnv += line + '\n';
          }      
        }
        resolve();
      }));
    }
    newEnv += `E5CC_AUTOSHUTOFF=${config.autoShutoff}\n`
      + `DISPLAY_SCREEN_SAVER=${config.screenSaverTimeout}\n`
      + `DISPLAY_SCREEN_OFF=${config.screenOffTimeout}\n`
      + `ENCODER_MIN_VALUE=${config.min}\n`
      + `ENCODER_MAX_VALUE=${config.max}\n`
      + `LOCALTUNNEL_SUBDOMAIN=${config.localtunnel || ''}\n`
      + `STARTUP_SOUND=${config.startupSound || 'appear'}\n`;
    
    await new Promise<void>(resolve => writeFile('./.env', newEnv, { encoding: 'utf8' }, err => {
      if (err) {
        throw err;
      }
      resolve();
    }));

    await setVolume(config.volume);
  
    loadConfig(newEnv);
    return {};
  } catch (e) {
    return { error: e.message };
  }
};

export const getVolume = async (): Promise<number> => {
  const volume = await new Promise<number>(resolve => {
    exec('amixer get Headphone | grep -E \'^ *Mono:\' | sed -E \'s/^ *Mono: Playback -?[0-9]+ \\[([0-9]+)%\\].*$/\\1/gi\'', (error, stdout, stderr) => {
      if (error) {
        resolve(100);
        console.error(stderr);
        return;
      }
      const value = parseInt(stdout);
      if (isNaN(value)) {
        resolve(100);
        return;
      }
      resolve(Math.round((value - 65) / 33 * 100));
    });
  });
  return volume;
};

export const setVolume = async (value: number): Promise<void> => {
  // set volume
  const volume = ((value / 100) * 33) + 65;
  let onoff = 'on';
  if (value === 0) {
    onoff = 'off';
  }
  await new Promise<void>(resolve => {
    exec(`amixer set Headphone ${onoff} ${volume}%`, () => {
      resolve();
    });
  });
};
