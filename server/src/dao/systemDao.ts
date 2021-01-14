/* eslint-disable quotes */
import { exec } from 'child_process';
import { setLed } from '../hardware/button';
import { playSound } from '../hardware/sound';
import { getSounds } from '../dao/soundsDao';
import { registerStateChange, setSharedState } from './sharedState';

let state = registerStateChange('system-dao', async (lastState, newState): Promise<void> => {
  state = newState;
});

export const restartService = async (): Promise<void> => {
  await setSharedState({ rebooting: true }, 'self');
  let count = 0;
  const restartTimer = async () => {
    if (state.cancel) {
      setSharedState({
        cancel: false,
      });
      return;
    }

    await playSound((await getSounds()).beep);
    setLed(true);
    await new Promise(resolve => setTimeout(resolve, 250));
    setLed(false);

    if (count >= 4) {
      exec('sudo systemctl restart fcenail');
      return;
    }
    count++;
    restartTimer();
  };
  restartTimer();
};

export const reboot = async (): Promise<void> => {
  await setSharedState({ rebooting: true }, 'self');
  let count = 0;
  const rebootTimer = async () => {
    if (state.cancel) {
      setSharedState({
        cancel: false,
      });
      return;
    }

    await playSound((await getSounds()).beep);
    setLed(true);
    await new Promise(resolve => setTimeout(resolve, 125));
    setLed(false);

    if (count >= 9) {
      exec('sudo reboot');
      return;
    }
    count++;
    rebootTimer();
  };
  rebootTimer();
};

export const checkForUpdates = async(): Promise<{ error?: string, stdout?: string, stderr?: string }> => {
  return new Promise(resolve => {
    try {
      exec(
        'sudo systemctl start fcenail-update.service',
        { encoding: 'utf8' }, (error, stdout, stderr) => {
          resolve({
            error: error?.message,
            stdout,
            stderr,
          });
        }
      );
    } catch (e) {
      resolve({
        error: e.message,
      });
    }
  });
};

export const getTimezones = async(): Promise<string[]> => {
  return new Promise(resolve => {
    try {
      exec(
        'timedatectl list-timezones',
        { encoding: 'utf8' }, (error, stdout) => {
          if (error) {
            resolve([]);
          } else {
            resolve(stdout.split('\n'));
          }
        }
      );
    } catch (e) {
      resolve([]);
    }
  });
};

export const getTimezone = async(): Promise<string> => {
  return new Promise(resolve => {
    try {
      exec(
        `timedatectl show | grep Timezone= | sed -E 's/^Timezone=(.*)$/\\1/gi'`,
        { encoding: 'utf8' }, (error, stdout) => {
          if (error) {
            resolve('');
          } else {
            resolve(stdout);
          }
        }
      );
    } catch (e) {
      resolve('');
    }
  });
};

export const setTimezone = async(timezone: string): Promise<string|undefined> => {
  return new Promise(resolve => {
    try {
      exec(
        `timedatectl set-timezone ${timezone}`,
        { encoding: 'utf8' }, (error) => {
          if (error) {
            resolve(error.message);
          } else {
            resolve();
          }
        }
      );
    } catch (e) {
      resolve(e.message);
    }
  });
};

export const updateTime = async(utcTime: number): Promise<string|undefined> => {
  return new Promise(resolve => {
    try {
      exec(
        `timedatectl set-ntp false; timedatectl set-time "${(new Date(utcTime)).toUTCString()}"; timedatectl set-ntp true;`,
        { encoding: 'utf8' }, (error) => {
          if (error) {
            resolve(error.message);
          } else {
            resolve();
          }
        }
      );
    } catch (e) {
      resolve(e.message);
    }
  });
};