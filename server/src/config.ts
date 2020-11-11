import { SerialPortOptions } from 'modbus-serial/ModbusRTU';

export const Config = {
  encoder: {
    A: process.env.ENCODER_A || 23,
    B: process.env.ENCODER_B || 24,
    S: process.env.ENCODER_S || 22,
    maxVelocity: process.env.ENCODER_MAX_VELOCITY || 25,
    minValue: process.env.ENCODER_MIN_VALUE || 0,
    maxValue: process.env.ENCODER_MAX_VALUE || 800,
    frequency: process.env.ENCODER_FREQUENCY || 100,
  },
  display: {
    interval: process.env.DISPALY_INTERVAL || 100,
    screenOffTimeout: process.env.DISPLAY_SCREEN_OFF || 2,
    screenSaverTimeout: process.env.DISPLAY_SCREEN_SAVER || 1,
  },
  e5cc: {
    device: process.env.E5CC_DEVICE || '/dev/ttyAMA0',
    interval: process.env.E5CC_INTERVAL || 500,
    autoShutoff: process.env.E5CC_AUTOSHUTOFF || 30,
    connectOptions: {
      baudRate: process.env.E5CC_BAUDRATE || 57600,
      dataBits: process.env.E5CC_DATABITS || 8,
      stopBits: process.env.E5CC_STOPBITS || 1,
      parity: process.env.E5CC_PARITY || 'even',
    } as SerialPortOptions,
  },
}