import dotenv from 'dotenv';
import { closeDisplay, setDisplayState } from './hardware/display';
import { closeE5cc, initE5cc, toggleE5ccState, updateE5ccSetPoint } from './hardware/e5cc';
import { closeEncoder, initEncoder, setEncoderValue } from './hardware/rotaryEncoder';
import { Config } from './config';
import { Api } from './api';
import { initSharedState, setSharedState } from './utility/sharedState';

let initialized = false;

// initialization
(async () => {
  dotenv.config();

  Api();
})();

initSharedState((lastState, state) => {
  setDisplayState(state);
});

initEncoder(
  Config.encoder.A, Config.encoder.B, Config.encoder.S, 
  async value => {
    if (!initialized) {
      return;
    }

    const newValue = await updateE5ccSetPoint(value);
    if (newValue !== value) {
      setEncoderValue(newValue);
    }
  },
  () => {
    toggleE5ccState();
  },
);

initE5cc((lastState, state) => {
  if (!initialized) {
    initialized = true;
    setEncoderValue(state.sp || 0);
  }

  setSharedState(state);
});


// capture interrupts and cleanup on exit
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('exit', () => {
  console.log('Cleaning up.');
  closeE5cc();
  closeEncoder();
  closeDisplay();
});

process.on('uncaughtException', (error) => {
  console.error(`Uncaught exception: ${error.message}`);
  closeE5cc();
  closeEncoder();
  closeDisplay();
});

