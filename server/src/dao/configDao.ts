import { exec } from '../utility/exec';
import { readFile, stat, writeFile } from 'fs';
import { registerConfigChange, loadConfig } from '../config';
import { IConfig } from '../models/IConfig';
import { setUrl } from './localDb';
import { updateVolumeState } from '../hardware/sound';

let Config = registerConfigChange('config-dao', newConfig => {
  Config = newConfig;
});

export const getConfig = async (): Promise<IConfig> => {
  const config: IConfig = {
    autoShutoff: Config.e5cc.autoShutoff,
    screenSaverTimeout: Config.display.screenSaverTimeout,
    screenOffTimeout: Config.display.screenOffTimeout,
    max: Config.encoder.maxValue,
    min: Config.encoder.minValue,
    localtunnel: Config.localtunnel.subdomain,
    volume: await getVolume(),
    startupSound: Config.settings.startupSound,
    buttonDebounce: Config.button.debounce,
    encoderButtonDebounce: Config.encoder.buttonDebounce
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
                'STARTUP_SOUND', 'BUTTON_DEBOUNCE', 'ENCODER_BUTTON_DEBOUNCE',
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
      + `STARTUP_SOUND=${config.startupSound || 'appear'}\n`
      + `BUTTON_DEBOUNCE=${(config.buttonDebounce || 50).toString()}\n`
      + `ENCODER_BUTTON_DEBOUNCE=${(config.encoderButtonDebounce || 50).toString()}\n`;
    
    await new Promise<void>(resolve => writeFile('./.env', newEnv, { encoding: 'utf8' }, err => {
      if (err) {
        throw err;
      }
      resolve();
    }));

    await setVolume(config.volume);
  
    if (config.localtunnel !== Config.localtunnel.subdomain) {
      let actions = ['enable', 'start'];
      if (config.localtunnel) {
        await setUrl(config.localtunnel);
      } else {
        actions = ['stop', 'disable'];
        await setUrl('');
      }
      for (const action of actions) {
        await exec(`systemctl ${action} fcenail-localtunnel.service`);
      }
    }
    
    loadConfig(newEnv);
    return {};
  } catch (e) {
    return { error: e.message };
  }
};

export const getVolume = async (): Promise<number> => {
  const { error, stderr, stdout } = await exec('amixer get Headphone | grep -E \'^ *Mono:\' | sed -E \'s/^ *Mono: Playback -?[0-9]+ \\[([0-9]+)%\\].*$/\\1/gi\'');
  if (error) {
    console.error(stderr);
    return 100;
  }
  if (!stdout) {
    return 100;
  }
    
  const value = parseInt(stdout);
  if (isNaN(value)) {
    return 100;
  }
    
  return Math.round((value - 65) / 33 * 100);
};

export const setVolume = async (value: number): Promise<void> => {
  // set volume
  const volume = ((value / 100) * 33) + 65;
  let onoff = 'on';
  if (value === 0) {
    onoff = 'off';
  }
  updateVolumeState(volume);
  await exec(`amixer set Headphone ${onoff} ${volume}%`);
};
