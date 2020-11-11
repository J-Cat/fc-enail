import e = require('express');
import ModbusRTU from 'modbus-serial';
import { Config } from '../config';
import { Constants } from '../models/Constants';
import { Lock } from '../utility/Lock';

const DEVICE = Config.e5cc.device;
const INTERVAL = Config.e5cc.interval;

const lock = new Lock();
const modbus = new ModbusRTU();

export interface IE5ccState {
  readonly sp?: number;
  readonly pv?: number;
  readonly running?: boolean;
  readonly tuning?: boolean;
  readonly nocoil?: boolean;
  readonly started?: number;
}

let state: IE5ccState = {
  sp: 0,
  pv: 0,
  running: false,
  tuning: false,
  nocoil: false,
  started: 0,
};
let lastState = state;

export const initE5cc = async (
  onData?: (lastState: IE5ccState, state: IE5ccState) => void
): Promise<void> => {
  await lock.acquire();
  try {
    await modbus.connectRTUBuffered(
      DEVICE, 
      Config.e5cc.connectOptions,
    );
    modbus.setID(1);
    modbus.setTimeout(1000);
  } finally {
    lock.release();
  }
  console.log('Connected to Omron E5CC.');

  const getData = async (): Promise<void> => {
    return new Promise(async resolve => {
      try {
        await lock.acquire();
        try {
          const statusReading = await modbus.readHoldingRegisters(Constants.e5cc.variables.status, 2);
          const status = statusReading?.data?.[1];
          const nocoil = (statusReading?.data?.[0] & Constants.e5cc.flags.nocoil) === Constants.e5cc.flags.nocoil;
          const running = (status & Constants.e5cc.flags.stopped) !== Constants.e5cc.flags.stopped
          state = {
            pv: nocoil ? 0 : (await modbus.readHoldingRegisters(Constants.e5cc.variables.presentValue, 1))?.data?.[0] || 0,
            sp: (await modbus.readHoldingRegisters(Constants.e5cc.variables.setPoint, 1))?.data?.[0] || 0,
            running,
            tuning: (status & Constants.e5cc.flags.tuning) === Constants.e5cc.flags.tuning,
            nocoil,
            started: !state.running && running ? Date.now() : state.started,
          }
        } finally {
          lock.release();
        }

        // if auto-shutoff should be triggered
        if (
          state.running && state.started !== 0 
          && (
            (Date.now() - (state.started || 0))
            >= (60000 * Config.e5cc.autoShutoff)
          )
        ) {
          await toggleE5ccState();
        }

        if (
          lastState.pv !== state.pv 
          || lastState.sp !== state.sp 
          || lastState.running !== state.running 
          || lastState.tuning !== state.tuning
          || lastState.nocoil !== state.nocoil
          || state.running
        ) {
          onData?.(lastState, state);
          lastState = state;
        }
      } catch (e) {
        console.error(`Error getting state: ${e.message}`);
      }
      setTimeout(async () => {
        resolve();
        await getData();
      }, INTERVAL);
    });
  }

  getData();
}

export const closeE5cc = () => {
  if (modbus?.isOpen) {
    modbus.close(() => {
      console.log('Omron E5CC connection closed.');
    });
  }
}

export const toggleE5ccState = async (): Promise<void> => {
  try {
    await lock.acquire();
    const running = state.running;
    await modbus.writeRegister(
      Constants.e5cc.commands.run, 
      running ? Constants.e5cc.commands.stop : Constants.e5cc.commands.start,
    );  
    if (running) {
      state = {
        ...state,
        running: false,
        started: 0,
      };
    } else {
      state = {
        ...state,
        running: true,
        started: Date.now(),
      };
    }
  } catch (e) {
    console.error(`Error toggling state: ${e.message}`);
  } finally {
    lock.release();
  }
}

export const updateE5ccSetPoint = async (value: number): Promise<number> => {
  try {
    await lock.acquire();
    const result = await modbus.writeRegister(Constants.e5cc.variables.setPoint, value);
    return result?.value;
  } catch (e) {
    console.error(`Error updating set point: ${e.message}`);
    return value;
  } finally {
    lock.release();
  }
}

export  const toggleE5ccTuning = async (percent: 40|100 = 100) => {
  try {
    await lock.acquire();
    const result = modbus.writeRegister(
      Constants.e5cc.commands.run, 
      state.tuning
        ? Constants.e5cc.commands.tuneCancel
        : percent === 100
        ? Constants.e5cc.commands.tune100
        : Constants.e5cc.commands.tune40,
    );
  } catch (e) {
    console.error(`Error toggling tuning state: ${e.message}`);
  } finally {
    lock.release();
  }
}