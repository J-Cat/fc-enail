import { SerialPortOptions } from 'modbus-serial/ModbusRTU';

export const Config = {
  encoder: {
    A: 23,
    B: 24,
    S: 22,
    maxVelocity: 25,
    minValue: 0,
    maxValue: 800,
    frequency: 100,
  },
  display: {
    interval: 100,
    screenOffTimeout: 2,
    screenSaverTimeout: 1,
  },
  e5cc: {
    device: '/dev/ttyAMA0',
    interval: 500,
    autoShutoff: 30,
    connectOptions: {
      baudRate: 57600,
      dataBits: 8,
      stopBits: 1,
      parity: 'even',
    } as SerialPortOptions,
  },
}