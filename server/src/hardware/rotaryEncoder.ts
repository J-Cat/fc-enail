import { Gpio } from 'pigpio';
import { Gpio as GpioOnOff, ValueCallback } from 'onoff';
import { registerConfigChange } from '../config';
import { Lock } from '../utility/Lock';

let Config = registerConfigChange('rotary-encoder', newConfig => {
  Config = newConfig;
});

const lock = new Lock();

const rotEncTable = [0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0];

let currentValue = 0;
let store = 0;
let prevNextCode = 0;
let lastValue = -1;
let _enforceMinMax = true;
let overrideMin: number | undefined = undefined;
let overrideMax: number | undefined = undefined;

let gpioA: Gpio;
let gpioB: Gpio;
let gpioSwitch: GpioOnOff;
let lastA = -1;
let lastB = -1;
let lastUpdate = Date.now();
let scale = 1;

const listenerA: (level: number, tick: number) => void = (value: number) => {
  processTick('a', value);
};
const listenerB: (level: number, tick: number) => void = (value: number) => {
  processTick('b', value);
};
const listenerSwitch: ValueCallback = (err, value) => {
  if (err) {
    return;
  }
  if (value === 0) {
    click?.();
  }
};
let click: (() => Promise<void>) | undefined;

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
    gpioA.off('interrupt', listenerA);
    // gpioA.unwatchAll();
  }
  if (gpioB) {
    gpioB.off('interrupt', listenerB);
    // gpioB.unwatchAll();
  }
  if (gpioSwitch) {
    gpioSwitch.unwatchAll();
    // gpioSwitch.unwatchAll();
  }
};

const processTick = async (from: 'a'|'b', value: number) => {  
  await lock.acquire();
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
      lastA = a;
      lastB = b;

      if (((store&0xff) === 0x2b) || ((store&0xff) === 0x17)) {
        const now = Date.now();
        if (now - lastUpdate < 150) {
          scale = Math.min(scale + 1, Config.encoder.maxVelocity);
        } else {
          scale = Math.max(1, scale - Math.ceil((now - lastUpdate) / 100));
        }
      }

      if ((store&0xff) === 0x2b) {
        if ((currentValue + scale > (overrideMax !== undefined ? overrideMax : Config.encoder.maxValue)) && _enforceMinMax) {
          currentValue = (overrideMax !== undefined ? overrideMax : Config.encoder.maxValue);
        } else {
          currentValue += scale;
        }
        lastUpdate = Date.now();
      }
      if ((store&0xff) === 0x17) {
        if ((currentValue - scale < (overrideMin !== undefined ? overrideMin : Config.encoder.minValue)) && _enforceMinMax) {
          currentValue = (overrideMin !== undefined ? overrideMin : Config.encoder.minValue);
        } else {
          currentValue -= scale;
        }
        lastUpdate = Date.now();
      }

    }

  } finally {
    lock.release();
  }
};

export const initEncoder = (
  pinA: number = Config.encoder.A, 
  pinB: number = Config.encoder.B, 
  pinSwitch: number = Config.encoder.S, 
  valueChanged?: (value: number) => Promise<void>,
  onClick?: () => Promise<void>,
  frequency = Config.encoder.frequency,
): void => {
  click = onClick;
  gpioA = new Gpio(pinA, {
    edge: Gpio.EITHER_EDGE,
    mode: Gpio.INPUT,
  });
  gpioB = new Gpio(pinB, {
    edge: Gpio.EITHER_EDGE,
    mode: Gpio.INPUT,
  });
  gpioSwitch = new GpioOnOff(pinSwitch, 'in', 'both');

  gpioA.on('interrupt', listenerA);

  gpioB.on('interrupt', listenerB);

  gpioSwitch.watch(listenerSwitch);

  const emitValue = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      lock.acquire().then(() => {
        if (currentValue !== lastValue) {
          valueChanged?.(currentValue);        
          lastValue = currentValue;
        }
      }).catch(e => {
        reject(e.message);
      }).finally(() => {
        lock.release();
      });
      setTimeout(async () => {
        resolve();
        await emitValue();
      }, frequency);  
    });
  };

  emitValue();
};

