import dotenv from 'dotenv';
import { closeDisplay } from './hardware/display';
import { closeE5cc, IE5ccState, initE5cc } from './hardware/e5cc';
import { closeEncoder, initEncoder, setEncoderValue } from './hardware/rotaryEncoder';
import { registerConfigChange } from './config';
import { Api } from './api';
import { ISharedState, registerStateChange, setSharedState } from './utility/sharedState';
import { emitE5cc, socketApi } from './socketApi';
import { closeButton, initButton, setLed } from './hardware/button';
import { exec } from 'child_process';
import { Lock } from './utility/Lock';
import { playSound } from './hardware/sound';
import { Sounds } from './models/sounds';
import { initTunnel } from './tunnel';
import { HomeMode } from './modes/homeMode';
import { initSettingsMenu, SettingsMode } from './modes/settingsMode';
import { PresetsMode } from './modes/presetsMode';
import { initProfilesMenu, ProfilesMode } from './modes/profilesMode';
import { initLocalDb } from './dao/localDb';
import { initScriptsMenu, ScriptsMode } from './modes/scriptsMode';

let Config = registerConfigChange('server', newConfig => {
  Config = newConfig;
});

registerStateChange('server', async (lastState, newState): Promise<void> => {
  await onSharedStateChange(lastState, newState);
});

const lock = new Lock();

let initialized = false;
let cancel = false;
let currentState: ISharedState = {};

// capture interrupts and cleanup on exit
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('exit', () => {
  console.log('Cleaning up.');
  cleanup();
});

process.on('uncaughtException', (error) => {
  console.error(`Uncaught exception: ${error.message}`);
  cleanup();
});

const cleanup = () => {
  closeE5cc();
  closeEncoder();
  closeDisplay();
  closeButton();
};

const processAction = (): boolean => {
  if (currentState.rebooting) {
    cancel = true;
  }
  if (currentState.loading) {
    return false;
  }
  if (!initialized) {
    return false;
  }
  return true;
};

const onButtonClick = async () => {
  if (!processAction()) {
    return;
  }

  await currentState.modes?.[currentState.mode || '']?.onClick();
};

const onLongButtonClick = async () => {
  if (!processAction()) {
    return;
  }

  await currentState.modes?.[currentState.mode || '']?.onLongClick?.();
}; 

// restart service on really long click
const onReallyLongButtonClick = () => {
  if (!processAction()) {
    return;
  }
  // restart service
};

// reboot on super long click
const onReallyReallyLongButonClick = async () => {
  await setSharedState({ rebooting: true }, 'self');
  let count = 0;
  const rebootTimer = async () => {
    if (cancel) {
      cancel = false;
      return;
    }

    await playSound(Sounds.beep);
    setLed(true);
    await new Promise(resolve => setTimeout(resolve, 250));
    setLed(false);
    await new Promise(resolve => setTimeout(resolve, 250));

    if (count >= 10) {
      exec('sudo reboot');
      return;
    }
    count++;
    rebootTimer();
  };
  rebootTimer();
};

const onEncoderChange = async (value: number) => {
  if (!processAction()) {
    return;
  }

  await currentState.modes?.[currentState.mode || '']?.onEncoderChange(value);
};

const onEncoderClick = async () => {
  if (!processAction()) {
    return;
  }

  //console.log(JSON.stringify(currentState, null, ' '));
  await currentState.modes?.[currentState.mode || '']?.onEncoderClick();
};

const onE5ccChange = async (lastState: IE5ccState | undefined, state: IE5ccState) => {
  if (!initialized) {
    initialized = true;
    setEncoderValue(state.sp || 0);
    await setLed(state.running || false);
  }

  await setSharedState(state, 'e5cc');
  emitE5cc({ ...state,  scriptRunning: currentState.scriptRunning || false, });
};

const onSharedStateChange = async (
  lastState: ISharedState | undefined, 
  state: ISharedState, 
): Promise<void> => {
  lock.acquire();
  try {
    currentState = {
      ...state,
    };
  
    if (lastState?.passcode !== state?.passcode && state?.passcode) {
      console.log(`Passcode: ${state.passcode}`);
    }  
  } finally {
    lock.release();
  }
};

// initialization
(async () => {
  dotenv.config();

  await initLocalDb();

  const settingsMenu = initSettingsMenu();
  setSharedState({
    menu: [settingsMenu],
    menus: [
      [settingsMenu],
      [initProfilesMenu()],
      [initScriptsMenu()],
    ],
    modes: {
      'home': HomeMode,
      'presets': PresetsMode,
      'scripts': ScriptsMode,
      'profiles': ProfilesMode,
      'settings': SettingsMode,      
    },
    mode: 'home',
  });

  const server = Api();
  socketApi(server);

  await initTunnel();

  await initButton(onButtonClick, onLongButtonClick, onReallyLongButtonClick, onReallyReallyLongButonClick);

  initEncoder(Config.encoder.A, Config.encoder.B, Config.encoder.S, onEncoderChange, onEncoderClick);

  initE5cc(onE5ccChange);

  //await showMessage('Connected to Linamar', Font.UbuntuMono_10ptFontInfo);
})();
