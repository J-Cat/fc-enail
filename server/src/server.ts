import dotenv from 'dotenv';
import { closeDisplay } from './hardware/display';
import { closeE5cc, initE5cc } from './hardware/e5cc';
import { IE5ccState } from './models/IE5ccState';
import { closeEncoder, initEncoder, setEncoderValue } from './hardware/rotaryEncoder';
import { registerConfigChange } from './config';
import { Api } from './api';
import { registerStateChange, setSharedState } from './dao/sharedState';
import { emitE5cc, socketApi } from './socketApi';
import { closeButton, initButton, setLed } from './hardware/button';
import { Lock } from './utility/Lock';
// import { initTunnel } from './tunnel';
import { HomeMode } from './modes/homeMode';
import { initSettingsMenu, SettingsMode } from './modes/settingsMode';
import { PresetsMode } from './modes/presetsMode';
import { initProfilesMenu, ProfilesMode } from './modes/profilesMode';
import { initLocalDb } from './dao/localDb';
import { initScriptsMenu, ScriptsMode } from './modes/scriptsMode';
import { reboot, restartService } from './dao/systemDao';
import { ISharedState } from './models/ISharedState';

let Config = registerConfigChange('server', newConfig => {
  Config = newConfig;
});

registerStateChange('server', async (lastState, newState): Promise<void> => {
  await onSharedStateChange(lastState, newState);
});

const lock = new Lock();

let initialized = false;
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
    setSharedState({
      cancel: true,
      rebooting: false,
    });
    return false;
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
const onReallyLongButtonClick = async () => {
  if (!processAction()) {
    return;
  }
  restartService();
};

// reboot on super long click
const onReallyReallyLongButonClick = async () => {
  if (!processAction()) {
    return;
  }

  reboot();
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
  emitE5cc({ 
    ...state, 
    scriptRunning: currentState.scriptRunning || false, 
    scriptFeedback: currentState.scriptFeedback,
  });
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

  // const tunnel = await initTunnel();

  await initButton(onButtonClick, onLongButtonClick, onReallyLongButtonClick, onReallyReallyLongButonClick);

  initEncoder(Config.encoder.A, Config.encoder.B, Config.encoder.S, onEncoderChange, onEncoderClick);

  initE5cc(onE5ccChange);

  process.stdin.resume();//so the program will not close instantly

  const exitHandler = (options: { cleanup?: boolean; exit?: boolean }, exitCode?: number): void => {
    if (options.cleanup) {
      console.log('Cleaning up before exit.');
      // tunnel?.close();
    }
    if (exitCode || exitCode === 0) {
      console.log(exitCode);
    }
    if (options.exit) {
      process.exit();
    }
  };
  
  //do something when app is closing
  process.on('exit', exitHandler.bind(null,{cleanup:true}));
  
  //catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, {exit:true}));
  
  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
  process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
  
  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
})();
