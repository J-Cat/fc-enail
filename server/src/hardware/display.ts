import { Color, display, Font, Layer } from 'ssd1306-i2c-js';
import { Config } from '../config';
import dayjs from 'dayjs';
import { Icons } from '../models/icons';
import { ISharedState } from '../utility/sharedState';

const SCALE = 1;
let sleeping = false;
let lastUpdate = 0;
let screenSaverDisabled = 0;
let dirty = true;
let showPasscode = false;
let state: ISharedState;
let pos = {
  x: 64,
  y: 40,
  lastX: 64,
  lastY: 40,
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

export const setDisplayState = async (newState: ISharedState): Promise<void> => {
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
    showPasscode = false;
    if (sleeping) {
      sleeping = false;
      await refresh();
    }
  }
  if (savedState.passcode !== newState.passcode && (newState.passcode?.length || 0) > 0) {
    showPasscode = true;
    screenSaverDisabled = Date.now();
    if (sleeping) {
      sleeping = false;
      await refresh();
    }
  } else if (newState.passcode !== savedState.passcode && (newState.passcode?.length || 0) === 0) {
    showPasscode = false;
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
    const timer = (Config.e5cc.autoShutoff * 60000) - (Date.now() - (state.started || 0));
    drawBitmap(0, 0, Icons.hourglass);
    display.drawString(18, 0, getTimeString(timer), 1, Color.White, Layer.Layer0);
  } else {
    drawBitmap(0, 0, Icons.clock);
    display.drawString(18, 0, dayjs(Date.now()).format('h:mm a'), 1, Color.White, Layer.Layer0);
  }

  if (showPasscode && (state.passcode?.length || 0) > 0) {
    drawBitmap(0, 42, Icons.lock);
    display.drawString(20, 40, state.passcode || '', 1, Color.White, Layer.Layer0);
    display.refresh();
    return;
  }

  display.setFont(Font.UbuntuMono_24ptFontInfo);
  if (
    (
      ((Config.display.screenSaverTimeout * 60000) - (Date.now() - screenSaverDisabled) <= 0) 
      || (screenSaverDisabled === 0)
    ) 
    && !showPasscode
  ) {
    const newXDir = 
      pos.xDir === 1
      ? pos.x + pos.xDir > (state.nocoil ? 50 : 64)
      ? -1
      : 1
      : pos.x + pos.xDir < 0
      ? 1
      : -1;
    const newYDir = 
      pos.yDir === 1
      ? pos.y + pos.yDir > (state.nocoil ? 46 : 40)
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
      ...(
        state.nocoil
        ? {
          x: 50, y: 46,
          lastX: 50, lastY: 46,    
        }
        : {
          x: 64, y: 40,
          lastX: 64, lastY: 40,    
        }
      )
    };
    drawBitmap(0, 40, Icons.home);
  }
  if (state.nocoil) {
    display.setFont(Font.UbuntuMono_16ptFontInfo);
    display.drawString(pos.x, pos.y, 'NO COIL', 1, Color.White, Layer.Layer0);
  } else {
    display.drawString(pos.x, pos.y, `${(state.pv || 0).toString().padStart(3)}F`, 1, Color.White, Layer.Layer0);
  }

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
