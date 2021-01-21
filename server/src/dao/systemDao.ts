/* eslint-disable quotes */
import { exec } from '../utility/exec';
import { setLed } from '../hardware/button';
import { playSound } from '../hardware/sound';
import { getSounds } from '../dao/soundsDao';
import { registerStateChange, setSharedState } from './sharedState';
import dayjs from 'dayjs';
import { ChildProcess, spawn } from 'child_process';

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
  try {
    await exec('sudo systemctl start fcenail-update.service');
    return {};
  } catch (e) {
    return {
      error: e.message,
    };
  }
};

export const getTimezones = async(): Promise<string[]> => {
  try {
    const { error, stdout } = await exec('timedatectl list-timezones');
    if (error || !stdout) {
      return [];
    } else {
      return stdout.split('\n').filter(t => t.trim() !== '');
    }
  } catch (e) {
    return [];
  }
};

export const getTimezone = async(): Promise<string> => {
  try {
    const { error, stdout } = await exec(`timedatectl show | grep Timezone= | sed -E 's/^Timezone=(.*)$/\\1/gi'`);
    if (error || !stdout) {
      return '';
    } else {
      return stdout;
    }
  } catch (e) {
    return '';
  }
};

export const setTimezone = async (timezone: string): Promise<string|void> => {
  try {
    await exec(`timedatectl set-timezone ${timezone}`);
  } catch (e) {
    return e.message;
  }
};

export const updateTime = async (utcTime: number): Promise<string|void> => {
  try {
    const { error } = await exec(
      `timedatectl set-ntp false; timedatectl set-time "${dayjs(utcTime).format('YYYY-MM-DD HH:mm:ss')}"; timedatectl set-ntp true;`
    );
    if (error) {
      return error.message;
    }
  } catch (e) {
    return e.message;
  }
};