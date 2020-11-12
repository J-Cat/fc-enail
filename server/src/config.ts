import { SerialPortOptions } from 'modbus-serial/ModbusRTU';
import dotenv from 'dotenv';

dotenv.config();

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
    commandTimeout: process.env.E5CC_COMMAND_TIMEOUT || 2000,
    connectOptions: {
      baudRate: process.env.E5CC_BAUDRATE || 57600,
      dataBits: process.env.E5CC_DATABITS || 8,
      stopBits: process.env.E5CC_STOPBITS || 1,
      parity: process.env.E5CC_PARITY || 'even',
    } as SerialPortOptions,
  },
  button: {
    buttonPin: process.env.BUTTON_BUTTON_PIN || 5,
    ledPin: process.env.BUTTON_LED_PIN || 6,
    longClick: process.env.BUTTON_LONG_CLICK || 1000,
    reallyLongClick: process.env.BUTTON_REALLY_LONG_CLICK || 3000,
    reallyReallyLongClick: process.env.BUTTON_REALLY_REALLY_LONG_CLICK || 8000,
  },
  email: {
    from: process.env.API_EMAIL_FROM,
    address: process.env.API_EMAIL_TO,
    sendgridApiKey: process.env.API_SENDGRID_API_KEY,
  }
}