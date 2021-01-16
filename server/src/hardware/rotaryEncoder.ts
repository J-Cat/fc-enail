import { Gpio } from 'onoff';
import { registerConfigChange } from '../config';
// import { Lock } from '../utility/Lock';

let Config = registerConfigChange('rotary-encoder', newConfig => {
  Config = newConfig;
});

// const lock = new Lock();

const rotEncTable = [0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0];

let currentValue = 0;
let store = 0;
let prevNextCode = 0;
let lastValue = -1;
const velocity: number[] = [0];
let _enforceMinMax = true;
let overrideMin: number | undefined = undefined;
let overrideMax: number | undefined = undefined;

export const setEncoderValue = (
  value: number, enforceMinMax = true, 
  min: number | undefined = undefined, max: number | undefined = undefined
): void => {
  currentValue = value;
  _enforceMinMax = enforceMinMax;
  overrideMin = min;
  overrideMax = max;
};

export const closeEncoder = (): void => {
  if (gpioA) {
    gpioA.unwatchAll();
  }
  if (gpioB) {
    gpioB.unwatchAll();
  }
  if (gpioSwitch) {
    gpioSwitch.unwatchAll();
  }
};

let gpioA: Gpio;
let gpioB: Gpio;
let gpioSwitch: Gpio;
let lastA = -1;
let lastB = -1;

export const initEncoder = (
  pinA: number = Config.encoder.A, 
  pinB: number = Config.encoder.B, 
  pinSwitch: number = Config.encoder.S, 
  valueChanged?: (value: number) => Promise<void>,
  onClick?: () => Promise<void>,
  frequency = Config.encoder.frequency,
): void => {
  gpioA = new Gpio(pinA, 'in', 'both'); 
  gpioB = new Gpio(pinB, 'in', 'both');
  gpioSwitch = new Gpio(pinSwitch, 'in', 'rising');

  const processTick = async (from: 'a'|'b', value: number) => {  
    // await lock.acquire();
    try {
      const a = from === 'a' ? value : lastA;
      const b = from === 'b' ? value : lastB;

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
          if (velocity.length > 3) {
            velocity.shift();
          }
          velocity.push(Date.now());
          const scale = Math.min(
            Math.max(
              Math.round(1 / ((Date.now() - velocity?.[0]) / 2000)),
              1
            ), 
            Config.encoder.maxVelocity
          );
          if ((currentValue + scale > (overrideMax !== undefined ? overrideMax : Config.encoder.maxValue)) && _enforceMinMax) {
            currentValue = (overrideMax !== undefined ? overrideMax : Config.encoder.maxValue);
          } else {
            currentValue += scale;
          }
        }
        if ((store&0xff) === 0x17) {
          if (velocity.length > 3) {
            velocity.shift();
          }
          velocity.push(Date.now());
          const scale = Math.min(
            Math.max(
              Math.round(1 / ((Date.now() - velocity?.[0]) / 2000)),
              1
            ), 
            Config.encoder.maxVelocity,
          );
          if ((currentValue - scale < (overrideMin !== undefined ? overrideMin : Config.encoder.minValue)) && _enforceMinMax) {
            currentValue = (overrideMin !== undefined ? overrideMin : Config.encoder.minValue);
          } else {
            currentValue -= scale;
          }
        }
      }

      lastA = a;
      lastB = b;
    } finally {
      // lock.release();
    }
  };

  gpioA.watch(async (err, value) => {
    if (err) {
      console.error(err);
      return;
    }

    await processTick('a', value);
  });

  gpioB.watch(async (err, value) => {
    if (err) {
      console.error(err);
      return;
    }

    await processTick('b', value);
  });

  gpioSwitch.watch((err) => {
    if (err) {
      console.error(err);
      return;
    }

    onClick?.();
  });

  const emitValue = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // lock.acquire().then(() => {
      if (currentValue !== lastValue) {
        valueChanged?.(currentValue);        
        lastValue = currentValue;
      }
      // }).catch(e => {
      //   reject(e.message);
      // }).finally(() => {
      //   lock.release();
      // });
      setTimeout(async () => {
        resolve();
        await emitValue();
      }, frequency);  
    });
  };

  emitValue();
};
