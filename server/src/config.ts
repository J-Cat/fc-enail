import { SerialPortOptions } from 'modbus-serial/ModbusRTU';
import dotenv from 'dotenv';
import { parseIntDefault } from './utility/parseIntDefault';

export interface IServerConfig {
  encoder: {
    A: number;
    B: number;
    S: number;
    maxVelocity: number;
    minValue: number;
    maxValue: number;
    frequency: number;
  };
  display: {
    interval: number;
    screenOffTimeout: number;
    screenSaverTimeout: number;
  }
  e5cc: {
    device: string;
    interval: number;
    autoShutoff: number;
    commandTimeout: number;
    connectOptions: SerialPortOptions;
  };
  button: {
    buttonPin: number;
    ledPin: number;
    longClick: number;
    reallyLongClick: number;
    reallyReallyLongClick: number;
  };
  localtunnel: {
    subdomain: string;
  };
}

const onChanges: {
  [key: string]: (newConfig: IServerConfig) => void;
} = {};

let config: IServerConfig;

export const loadConfig = (newEnv?: string): void => {
  dotenv.config();

  if (newEnv) {
    const parsed = dotenv.parse(newEnv);
    for (const key of Object.keys(parsed)) {
      console.log(`Updating ${key}=${parsed[key]}`);
      process.env[key] = parsed[key];
    }
  }

  config = {
    encoder: {
      A: parseIntDefault(process.env.ENCODER_A, 23),
      B: parseIntDefault(process.env.ENCODER_B, 24),
      S: parseIntDefault(process.env.ENCODER_S, 22),
      maxVelocity: parseIntDefault(process.env.ENCODER_MAX_VELOCITY, 25),
      minValue: parseIntDefault(process.env.ENCODER_MIN_VALUE, 0),
      maxValue: parseIntDefault(process.env.ENCODER_MAX_VALUE, 800),
      frequency: parseIntDefault(process.env.ENCODER_FREQUENCY, 100),
    },
    display: {
      interval: parseIntDefault(process.env.DISPALY_INTERVAL, 100),
      screenOffTimeout: parseIntDefault(process.env.DISPLAY_SCREEN_OFF, 2),
      screenSaverTimeout: parseIntDefault(process.env.DISPLAY_SCREEN_SAVER, 1),
    },
    e5cc: {
      device: process.env.E5CC_DEVICE || '/dev/ttyAMA0',
      interval: parseIntDefault(process.env.E5CC_INTERVAL, 500),
      autoShutoff: parseIntDefault(process.env.E5CC_AUTOSHUTOFF, 30),
      commandTimeout: parseIntDefault(process.env.E5CC_COMMAND_TIMEOUT, 2000),
      connectOptions: {
        baudRate: parseIntDefault(process.env.E5CC_BAUDRATE, 57600),
        dataBits: parseIntDefault(process.env.E5CC_DATABITS, 8),
        stopBits: parseIntDefault(process.env.E5CC_STOPBITS, 1),
        parity: process.env.E5CC_PARITY || 'even',
      } as SerialPortOptions,
    },
    button: {
      buttonPin: parseIntDefault(process.env.BUTTON_BUTTON_PIN, 5),
      ledPin: parseIntDefault(process.env.BUTTON_LED_PIN, 6),
      longClick: parseIntDefault(process.env.BUTTON_LONG_CLICK, 1000),
      reallyLongClick: parseIntDefault(process.env.BUTTON_REALLY_LONG_CLICK, 3000),
      reallyReallyLongClick: parseIntDefault(process.env.BUTTON_REALLY_REALLY_LONG_CLICK, 8000),
    },
    localtunnel: {
      subdomain: process.env.LOCALTUNNEL_SUBDOMAIN || '',
    },
  };

  for (const key of Object.keys(onChanges)) {
    onChanges[key]?.(config);
  }
};

export const registerConfigChange = (key: string, onChange?: (newConfig: IServerConfig) => void): IServerConfig => {
  if (onChange) {
    onChanges[key] = onChange;
  }
  return {...config};
};

loadConfig();