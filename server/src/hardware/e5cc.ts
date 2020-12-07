import ModbusRTU from 'modbus-serial';
import { registerConfigChange } from '../config';
import { saveProfile } from '../dao/profilesDao';
import { Constants } from '../models/Constants';
import { getSounds } from '../models/sounds';
import { getCurrentProfile, getProfile, getQuickSet } from '../dao/localDb';
import { Lock } from '../utility/Lock';
import { registerStateChange } from '../dao/sharedState';
import { showMessage } from './display';
import { playSound } from './sound';

let Config = registerConfigChange('e5cc', newConfig => {
  Config = newConfig;
});
let presets: number[] = [];

registerStateChange('e5cc', async (oldState, newState, source) => {
  if (oldState?.tuning !== newState.tuning && !newState.tuning) {
    const pid = await getPidSettings();
    if (!pid) {
      showMessage('Error updating profile.');
      return;
    }
    const key = getCurrentProfile();
    const { profile } = getProfile(key);
    if (!profile) {
      return;
    }
    
    await saveProfile({
      ...profile, 
      ...pid,
    });
  }

  if (source === 'e5cc') {
    return;
  }

  if (oldState?.running !== newState.running) {
    await toggleE5ccState();
  }
  if (newState.sp && oldState?.sp !== newState.sp) {
    await updateE5ccSetPoint(newState.sp);
  }
  
  if (newState.mode === 'presets') {
    if (newState.mode !== oldState?.mode) {
      presets = getQuickSet();  
    } else if (newState.currentPreset !== oldState.currentPreset) {
      await updateE5ccSetPoint(presets[newState.currentPreset || 0]);
    }
  }  
});

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
    modbus.setTimeout(Config.e5cc.commandTimeout);
  } finally {
    lock.release();
  }
  console.log('Connected to Omron E5CC.');

  const getData = async (): Promise<void> => {
    try {
      if (lock.locked) {
        setTimeout(async () => {
          await getData();
          return;
        }, INTERVAL);
        return;    
      }

      await lock.acquire();
      try {
        const statusReading = await modbus.readHoldingRegisters(Constants.e5cc.variables.status, 2);
        const status = statusReading?.data?.[1];
        const nocoil = (statusReading?.data?.[0] & Constants.e5cc.flags.nocoil) === Constants.e5cc.flags.nocoil;
        const running = (status & Constants.e5cc.flags.stopped) !== Constants.e5cc.flags.stopped;
        state = {
          pv: nocoil ? 0 : (await modbus.readHoldingRegisters(Constants.e5cc.variables.presentValue, 1))?.data?.[0] || 0,
          sp: (await modbus.readHoldingRegisters(Constants.e5cc.variables.setPoint, 1))?.data?.[0] || 0,
          running,
          tuning: (status & Constants.e5cc.flags.tuning) === Constants.e5cc.flags.tuning,
          nocoil,
          started: !state.running && running ? Date.now() : state.started,
        };
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
        for (let i = 0; i < 3; i++) {
          playSound((await getSounds()).beep);
          await new Promise(resolve => setTimeout(resolve, 750));
        }
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
      try {
        await getData();
      } catch (e) {
        console.error(`An error occured retrieving E5CC state: ${e.message}`);
      }
      return;
    }, INTERVAL);
  };

  getData();
};

export const closeE5cc = (): void => {
  if (modbus?.isOpen) {
    modbus.close(() => {
      console.log('Omron E5CC connection closed.');
    });
  }
};

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
};

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
};

export  const toggleE5ccTuning = async (percent: 40|100 = 100): Promise<void> => {
  try {
    await lock.acquire();
    modbus.writeRegister(
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
};

export const getPidSettings = async (): Promise<{ p: number, i: number, d: number, offset: number}|undefined> => {
  try {
    await lock.acquire();

    let offset = (await modbus.readHoldingRegisters(Constants.e5cc.variables.inputShift, 1))?.data?.[0] || 0;
    if (offset > 9999) {
      offset -= 0x10000;
    }
    offset = Math.round(offset / 10);
    return {
      p: (await modbus.readHoldingRegisters(Constants.e5cc.variables.p, 1))?.data?.[0] || 0,
      i: (await modbus.readHoldingRegisters(Constants.e5cc.variables.i, 1))?.data?.[0] || 0,
      d: (await modbus.readHoldingRegisters(Constants.e5cc.variables.d, 1))?.data?.[0] || 0,
      offset,
    };
  } catch (e) {
    console.error(`Error getting PID settings: ${e.message}`);
  } finally {
    lock.release();
  }
};

export const setPidSettings = async (p: number, i: number, d: number, offset: number): Promise<void> => {
  try {
    await lock.acquire();
    
    const realOffset = offset < 0
      ? (offset * 10) + 0x10000
      : offset * 10;
    await modbus.writeRegister(Constants.e5cc.variables.p, p);
    await modbus.writeRegister(Constants.e5cc.variables.i, i);
    await modbus.writeRegister(Constants.e5cc.variables.d, d);
    await modbus.writeRegister(Constants.e5cc.variables.inputShift, realOffset);
  } catch (e) {
    console.error(`Error setting PID settings: ${e.message}`);
  } finally {
    lock.release();
  }
};
