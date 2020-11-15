import dotenv from 'dotenv';
import { closeDisplay, setDisplayState } from './hardware/display';
import { closeE5cc, getPidSettings, IE5ccState, initE5cc, toggleE5ccState, updateE5ccSetPoint } from './hardware/e5cc';
import { closeEncoder, initEncoder, setEncoderValue } from './hardware/rotaryEncoder';
import { registerConfigChange } from './config';
import { Api } from './api';
import { initSharedState, ISharedState, setSharedState } from './utility/sharedState';
import { emitE5cc, emitPidSettings, socketApi } from './socketApi';
import { closeButton, initButton, setLed } from './hardware/button';
import { exec } from 'child_process';
import { Lock } from './utility/Lock';
import { getCurrentProfile, getProfile, getUrl, setProfile, setUrl } from './utility/localDb';
import { playSound } from './hardware/sound';
import { Sounds } from './models/sounds';
import { initTunnel } from './tunnel';

let Config = registerConfigChange(newConfig => {
  Config = newConfig;
});

const lock = new Lock();

let initialized = false;
let cancel = false;
let currentState: ISharedState = {};

const processAction = () => {
  if (currentState.rebooting) {
    cancel = true;
  }
}

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
}

const onButtonClick = async () => {
  processAction();
  await setSharedState({ running: !currentState.running })
};

const onLongButtonClick = () => {
  processAction()
  console.log('long click');
}; 

// restart service on really long click
const onReallyLongButtonClick = () => {
  processAction()
  // restart service
  console.log('really long click');
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
  }
  rebootTimer();
};

const onSharedStateChange = async (
  lastState: ISharedState | undefined, 
  state: ISharedState, 
  source: 'e5cc'|'api'|'self'
): Promise<void> => {
  lock.acquire();
  try {
    currentState = {
      ...state,
    };
  
    if (!initialized) {
      return;
    }
  
    setDisplayState(state);
  
    if (lastState?.running !== state.running) {
      await setLed(state.running || false);
    }

    if (
      lastState?.tuning !== undefined && state.tuning !== undefined
      && lastState?.tuning !== state.tuning && !state.tuning
    ) {
      const pid = await getPidSettings()
      if (pid) {
        let profile = getProfile(getCurrentProfile());
  
        if (profile) {
          emitPidSettings({
            ...profile,
            ...pid,
          });
        }  
      }
    }
  
    if (source === 'e5cc') {
      return;
    }
  
    if (lastState?.passcode !== state?.passcode && state?.passcode) {
      console.log(`Passcode: ${state.passcode}`);
    }
  
    if (lastState?.running !== state.running) {
      await toggleE5ccState();
    } else if (state.sp && lastState?.sp !== state.sp) {
      await updateE5ccSetPoint(state.sp);
    }  
  } finally {
    lock.release();
  }
};

const onEncoderChange = async (value: number) => {
  processAction()
  if (!initialized) {
    return;
  }

  const newValue = await updateE5ccSetPoint(value);
  if (newValue !== value) {
    setEncoderValue(newValue);
  }
};

const onEncoderClick = () => {
  processAction()
  // back button
  switch (currentState.mode || 'home') {
    case 'home': {
      setSharedState({ mode: 'settings' }, 'self');
      break;
    }
    case 'settings': {
      setSharedState({ mode: 'profiles' }, 'self');
      break;
    }
    case 'profiles': {
      setSharedState({ mode: 'home' }, 'self');
      break;
    }
  }
};

const onE5ccChange = async (lastState: IE5ccState | undefined, state: IE5ccState) => {
  if (!initialized) {
    initialized = true;
    setEncoderValue(state.sp || 0);
    await setLed(state.running || false)
  }

  await setSharedState(state, 'e5cc');
  emitE5cc(state);
};

// initialization
(async () => {
  dotenv.config();

  const server = Api();
  socketApi(server);

  await initTunnel();

  await initButton(onButtonClick, onLongButtonClick, onReallyLongButtonClick, onReallyReallyLongButonClick);

  initSharedState(onSharedStateChange);

  initEncoder(Config.encoder.A, Config.encoder.B, Config.encoder.S, onEncoderChange, onEncoderClick);

  initE5cc(onE5ccChange);
})();
