import { exec } from 'child_process';
import { setLed } from '../hardware/button';
import { playSound } from '../hardware/sound';
import { Sounds } from '../models/sounds';
import { ISharedState, registerStateChange, setSharedState } from '../utility/sharedState';

let state: ISharedState;
registerStateChange('system-dao', async (lastState, newState): Promise<void> => {
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

    await playSound(Sounds.beep);
    setLed(true);
    await new Promise(resolve => setTimeout(resolve, 250));
    setLed(false);
    await new Promise(resolve => setTimeout(resolve, 250));

    if (count >= 5) {
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

    await playSound(Sounds.beep);
    setLed(true);
    await new Promise(resolve => setTimeout(resolve, 125));
    setLed(false);
    await new Promise(resolve => setTimeout(resolve, 125));

    if (count >= 10) {
      exec('sudo reboot');
      return;
    }
    count++;
    rebootTimer();
  };
  rebootTimer();
};