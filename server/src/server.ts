import dotenv from 'dotenv';
import { closeDisplay } from './hardware/display';
import { closeE5cc, getPidSettings, initE5cc } from './hardware/e5cc';
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
import { initialize, terminate } from 'pigpio';
import { initSound } from './hardware/sound';

// initialize pigpio before anything else
initialize();

let Config = registerConfigChange('server', newConfig => {
  Config = newConfig;
});

registerStateChange('server', async (lastState, newState): Promise<void> => {
  await onSharedStateChange(lastState, newState);
});

const lock = new Lock();

let initialized = false;
let currentState: ISharedState = {};

process.stdin.resume();//so the program will not close instantly

const cleanup = () => {
  closeE5cc();
  closeEncoder();
  closeDisplay();
  closeButton();
  terminate();
};

const exitHandler = (options: { cleanup?: boolean; exit?: boolean }, exitCode?: number): void => {
  console.log('Exiting FC E-Nail ...');
  if (options.cleanup) {
    console.log('Cleaning up before exit.');
    cleanup();
  }
  if (exitCode || exitCode === 0) {
    console.log(`Exit code: ${exitCode}`);
  }
  if (options.exit) {
    process.exit();
  }
};

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}, 0));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}, 3));
// CATCHES TERMINATE
process.on('SIGTERM', exitHandler.bind(null, {exit:true}, 4));
//process.on('SIGKILL', exitHandler.bind(null, {exit:true}, 5));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}, 1));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}, 1));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}, 1));

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

const onEncoderLongClick = async () => {
  if (!processAction()) {
    return;
  }

  //console.log(JSON.stringify(currentState, null, ' '));
  await currentState.modes?.[currentState.mode || '']?.onEncoderLongClick?.();
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

  initEncoder(Config.encoder.A, Config.encoder.B, Config.encoder.S, onEncoderChange, onEncoderClick, onEncoderLongClick);

  await initE5cc(onE5ccChange);

  setSharedState({
    pid: await getPidSettings(),
  });
  
  await initSound();
})();
