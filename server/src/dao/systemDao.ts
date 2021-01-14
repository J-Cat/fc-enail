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