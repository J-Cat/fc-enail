import { Gpio } from 'onoff';
import { registerConfigChange } from '../config';
import { Lock } from '../utility/Lock';

let Config = registerConfigChange(newConfig => {
  Config = newConfig;
});

const lock = new Lock();

const MIN_VALUE = Config.encoder.minValue;
const MAX_VALUE = Config.encoder.maxValue;

const MAX_VELOCITY = Config.encoder.maxVelocity;
const rotEncTable = [0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0];

let currentValue = 0;
let store = 0;
let prevNextCode = 0;
let lastValue = -1;
let velocity: number[] = [0];

export const setEncoderValue = (value: number) => {
  currentValue = value;
}

export const closeEncoder = () => {
  if (gpioA) {
    gpioA.unwatchAll();
  }
  if (gpioB) {
    gpioB.unwatchAll();
  }
  if (gpioSwitch) {
    gpioSwitch.unwatchAll();
  }
}

let gpioA: Gpio;
let gpioB: Gpio;
let gpioSwitch: Gpio;

export const initEncoder = (
  pinA: number = Config.encoder.A, 
  pinB: number = Config.encoder.B, 
  pinSwitch: number = Config.encoder.S, 
  valueChanged = (value: number) => {},
  onClick = () => {},
  frequency = Config.encoder.frequency,
) => {
  gpioA = new Gpio(pinA, 'in', 'both'); 
  gpioB = new Gpio(pinB, 'in', 'both');
  gpioSwitch = new Gpio(pinSwitch, 'in', 'rising');

  const processTick = async (from: 'a'|'b') => {  
    lock.acquire();
    try {
      const a = await gpioA.read();
      const b = await gpioB.read();
      prevNextCode <<= 2;
      if (b === 1) {
        prevNextCode |= 0x02;
      }
      if (a === 1) {
        prevNextCode |= 0x01;
      }
      prevNextCode &= 0x0f;

      if (rotEncTable[prevNextCode] === 1) {
        store <<= 4;
        store |= prevNextCode;

        if ((store&0xff) === 0x2b) {
          if (velocity.length > 4) {
            velocity.shift();
          }
          velocity.push(Date.now());
          const scale = Math.min(
            Math.max(
              Math.round(1 / ((Date.now() - velocity?.[0]) / 1000)),
              1
            ), 
            MAX_VELOCITY
          );
          if (currentValue + scale > MAX_VALUE) {
            currentValue = MAX_VALUE;
          } else {
            currentValue += scale;
          }
        }
        if ((store&0xff) === 0x17) {
          if (velocity.length > 4) {
            velocity.shift();
          }
          velocity.push(Date.now());
          const scale = Math.min(
            Math.max(
              Math.round(1 / ((Date.now() - velocity?.[0]) / 1000)),
              1
            ), 
            MAX_VELOCITY
          );
          if (currentValue - scale < MIN_VALUE) {
            currentValue = MIN_VALUE;
          } else {
            currentValue -= scale;
          }
        }
      }
    } finally {
      lock.release();
    }
  }

  gpioA.watch(async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    processTick('a');
  });

  gpioB.watch(async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    processTick('b');
  });

  gpioSwitch.watch((err, value) => {
    if (err) {
      console.error(err);
      return;
    }

    onClick();
  });

  const emitValue = (): Promise<void> => {
    return new Promise(resolve => {
      if (currentValue !== lastValue) {
        valueChanged(currentValue);        
        lastValue = currentValue;
      }
      setTimeout(async () => {
        resolve();
        await emitValue();
      }, frequency);  
    });
  }

  emitValue();
}
