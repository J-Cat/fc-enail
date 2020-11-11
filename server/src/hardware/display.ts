import { Color, display, Font, Layer } from 'ssd1306-i2c-js';
import { Config } from '../config';
import dayjs from 'dayjs';
import { IEccState } from './e5cc';
import { Icons } from '../icons';

const SCALE = 1;
let sleeping = false;
let lastUpdate = 0;
let screenSaverDisabled = 0;
let dirty = true;
let state: IEccState;
let pos = {
  x: 64,
  y: 42,
  lastX: 64,
  lastY: 42,
  xDir: -1,
  yDir: -1,
};

const init = async (): Promise<void> => {
  display.init(1, 60);
  display.turnOn();
  display.setFont(Font.UbuntuMono_24ptFontInfo);
  display.clearScreen();
  drawBitmap(32, 0, Icons.stealie);
  display.refresh();
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  refresh();
}

const refresh = (): Promise<void> => {
  if (dirty) {
    dirty = false;
    lastUpdate = Date.now();
  }
  if (
    ((Config.display.screenOffTimeout * 60000) - (Date.now() - lastUpdate) > 0)
    || (lastUpdate === 0) 
    || state.running
  ) {
    render();
  } else if (!sleeping) {
    sleeping = true;
    display.clearScreen();
    display.refresh();
    return Promise.resolve();
  }
  return new Promise(resolve => {
    setTimeout(async () => {
      resolve();
      await refresh();
    }, Config.display.interval);
  });
}

export const setDisplayState = async (newState: IEccState): Promise<void> => {
  dirty = true;
  const savedState = {...(state || {})};
  state = {
    ...(state || {}),
    ...newState
  };
  if (
    (newState.sp !== savedState?.sp)
    || (newState.running !== savedState?.running)
    || (newState.tuning !== savedState?.tuning)
    || (newState.nocoil !== savedState?.nocoil)
  ) {
    screenSaverDisabled = Date.now();  
    if (sleeping) {
      sleeping = false;
      await refresh();
    }
  }
}

export const closeDisplay = () => {
  display.clearScreen();
  display.turnOff();
  display.dispose();
}

const getTimeString = (value: number): string => {
  const h = Math.floor(value / 3600000);
  const m = Math.floor(
    (value - (h * 3600000))
    /
    60000
  );
  const s = Math.floor(
    (value - (h * 3600000) - (m * 60000))
    /
    1000
  )
  return `${h !== 0 ? `${h.toString()}:` : ''}${h === 0 ? m.toString() : m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const render = () => {
  display.clearScreen();

  if (!state) {
    return;
  }

  display.setFont(Font.UbuntuMono_16ptFontInfo);
  if (state.running) {
    const timer = (Config.e5cc.autoShutoff * 60000) - (Date.now() - state.started);
    drawBitmap(0, 0, Icons.hourglass);
    display.drawString(18, 0, getTimeString(timer), 1, Color.White, Layer.Layer0);
  } else {
    drawBitmap(0, 0, Icons.clock);
    display.drawString(18, 0, dayjs(Date.now()).format('h:mm a'), 1, Color.White, Layer.Layer0);
  }

  display.setFont(Font.UbuntuMono_24ptFontInfo);
  if (
    ((Config.display.screenSaverTimeout * 60000) - (Date.now() - screenSaverDisabled) <= 0) 
    || (screenSaverDisabled === 0)
  ) {
    const newXDir = 
      pos.xDir === 1
      ? pos.x + pos.xDir > 64
      ? -1
      : 1
      : pos.x + pos.xDir < 0
      ? 1
      : -1;
    const newYDir = 
      pos.yDir === 1
      ? pos.y + pos.yDir > 42
      ? -1
      : 1
      : pos.y + pos.yDir < 28
      ? 1
      : -1;
    pos = {
      xDir: newXDir,
      yDir: newYDir,
      x: pos.x + (pos.xDir * SCALE),
      y: pos.y + (pos.yDir * SCALE),
      lastX: pos.x,
      lastY: pos.y,
    };
  } else {
    pos = {
      xDir: -1, yDir: -1,
      x: 64, y: 42,
      lastX: 64, lastY: 42,
    };
    drawBitmap(0, 42, Icons.home);
  }
  display.drawString(pos.x, pos.y, `${state.sp.toString().padStart(3)}F`, 1, Color.White, Layer.Layer0);

  display.refresh();
}

const drawBitmap = ( xPos: number, yPos: number, { width, data }: { width: number, height: number, data: Uint8Array }) => {
  let s: string = '';
  for (let pos = 0; pos < data.length; pos++) {
      for (let c = 0; c < 8; c++) {
          if (((data[pos] >> (7 - c)) & 0b1) === 0b1) {
              s += 'X';
              display.drawPixel(
                  ((((pos % (width / 8)) * 8) + c) * 1) + xPos, 
                  (Math.floor(pos / (width / 8)) * 1) + yPos, 
                  Color.White, 
                  Layer.Layer0);
          } else {
              s += ' ';
          }
      }
      if (pos % (width / 8) === 1) {
          s += '\n';
      }
  }
  //console.log(s);
}

init();
