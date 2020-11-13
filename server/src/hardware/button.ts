import dotenv from 'dotenv';
import { Gpio } from 'onoff';
import { Config } from '../config';

export type ClickFunc = () => void;

dotenv.config();

let button = new Gpio(Config.button.buttonPin, 'in', 'both');
let led = new Gpio(Config.button.ledPin, 'out');
let down = 0;
let ledState = false;

export const setLed = async (state: boolean): Promise<void> => {
  ledState = state;
  
  if (!led) {
    return;
  }
  await led.write(state ? 1 : 0);
}

export const initButton = async (
  onClick: ClickFunc, 
  onLongClick?: ClickFunc, 
  onReallyLongClick?: ClickFunc,
  onReallyReallyLongClick?: ClickFunc,
): Promise<void> => {
  await led.write(ledState ? 1 : 0);
  button.watch((error, value) => {
    if (error) {
      console.error(`An error occured processing the button: ${error.message}`);
      return;
    }
    if (value === 0) {
      down = Date.now();
      return;
    }

    try {
      const elapsed = down === 0 ? 0 : Date.now() - down;
      if (elapsed >= Config.button.reallyReallyLongClick) {
        onReallyReallyLongClick?.();
        return;
      }
      if (elapsed >= Config.button.reallyLongClick) {
        onReallyLongClick?.();
        return;
      }
      if (elapsed >= Config.button.longClick) {
        onLongClick?.();
        return;
      }
      onClick?.();
    } finally {
      down = 0;
    }
  });
}

export const closeButton = () => {
  if (led) {
    led.write(0);
  }
  if (button) {
    button.unwatchAll();
  }
}