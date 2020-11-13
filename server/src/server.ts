import dotenv from 'dotenv';
import { closeDisplay, setDisplayState } from './hardware/display';
import { closeE5cc, initE5cc, toggleE5ccState, updateE5ccSetPoint } from './hardware/e5cc';
import { closeEncoder, initEncoder, setEncoderValue } from './hardware/rotaryEncoder';
import { Config } from './config';
import { Api } from './api';
import { initSharedState, ISharedState, setSharedState } from './utility/sharedState';
import { emit, socketApi } from './socketApi';
import { closeButton, initButton, setLed } from './hardware/button';
import { exec } from 'child_process';
import localtunnel, { Tunnel } from 'localtunnel';
import mail from '@sendgrid/mail';
import { Lock } from './utility/Lock';
import { getUrl, setUrl } from './utility/localDb';
import { playSound } from './hardware/sound';
import { Sounds } from './models/sounds';

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

// initialization
(async () => {
  dotenv.config();

  const server = Api();
  socketApi(server);

  try {
    const tunnel = await localtunnel({ 
      port: process.env.API_PORT || 8000,
      subdomain: 'jcat', 
      allow_invalid_cert: true,  
    });
    console.log(`localtunnel.me URL: ${tunnel.url}`);
    await setSharedState({ url: tunnel.url }, 'self');
    // if url changed, send e-mail
    if (getUrl() !== tunnel.url) {
      await setUrl(tunnel.url);
      if (Config.email.address?.length && Config.email.sendgridApiKey?.length) {
        try {
          mail.setApiKey(Config.email.sendgridApiKey);
          await mail.send({
            from: Config.email.from || 'fcenail@jcatvapes.com',
            to: Config.email.address,
            subject: 'New FC-Enail URL',
            text: `Your new FC-Enail public URL is: ${tunnel.url}`,
          });
        } catch (e) {
          console.error(`An error occurred sending the NGROK URL to your e-mail address (${Config.email.address}): ${e.message}`);
        }
      }
    }
  } catch (e) {
    console.error(`An error occurred connecting to localtunnel.me: ${e.message}`);
  }

  await initButton(
    async () => {
      processAction();
      await setSharedState({ running: !currentState.running })
    }, 
    () => {
      processAction()
      console.log('long click');
    }, 
    () => {
      processAction()
      // restart service
      console.log('really long click');
    }, 
    async () => {
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
    }, 
  );
})();

initSharedState(async (lastState, state, source) => {
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
});

initEncoder(
  Config.encoder.A, Config.encoder.B, Config.encoder.S, 
  async value => {
    processAction()
    if (!initialized) {
      return;
    }

    const newValue = await updateE5ccSetPoint(value);
    if (newValue !== value) {
      setEncoderValue(newValue);
    }
  },
  () => {
    processAction()
    // back button
  },
);

initE5cc(async (lastState, state) => {
  if (!initialized) {
    initialized = true;
    setEncoderValue(state.sp || 0);
    await setLed(state.running || false)
  }

  await setSharedState(state, 'e5cc');
  emit('E5CC', state);
});
