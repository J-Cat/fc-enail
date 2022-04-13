import { Color, display, Font, Layer } from 'ssd1306-i2c-js';
import { registerConfigChange } from '../config';
import dayjs from 'dayjs';
import { getHourglass, Icons, IIcon } from '../models/icons';
import { registerStateChange, setSharedState } from '../dao/sharedState';
import { getNetworkInfo } from '../dao/networkDao';
import { getQuickSet, getUrl } from '../dao/localDb';
import { renderPrompt } from '../modes/promptinput';
import { renderTextInput } from '../modes/textinput';
import { renderNumberInput } from '../modes/numberinput';
import { getTimeString } from '../utility/getTimeString';
import { renderRunningScript } from '../utility/scriptEngine';
import { ISharedState } from '../models/ISharedState';

let Config = registerConfigChange('display', newConfig => {
  Config = newConfig;
});

let networkInfo: { network?: { mode: string; ssid: string; address: string; ssids: string[]; } } | undefined;
let presets: number[] = [];

let state = registerStateChange('oled', async (oldState, newState): Promise<void> => {
  setDisplayState(newState);
  if (oldState?.mode !== newState.mode && newState.mode === 'presets') {
    presets = getQuickSet();
  }
  if (newState?.menu?.[newState?.menu?.length-1]?.action === 'network') {
    networkInfo = await getNetworkInfo();
  }
});

const SCALE = 1;
let sleeping = false;
let lastUpdate = 0;
let screenSaverDisabled = 0;
let dirty = true;
let showPasscode = false;
let pos = {
  x: 64,
  y: 40,
  lastX: 64,
  lastY: 40,
  xDir: -1,
  yDir: -1,
};
let isMessage = false;

const init = async (): Promise<void> => {
  display.init(1, 60);
  display.turnOn();
  display.setFont(Font.UbuntuMono_24ptFontInfo);
  display.clearScreen();
  drawBitmap(0, 0, Icons.fcenail);
  display.refresh();
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  refresh();
};

const refresh = async (): Promise<void> => {
  if (dirty) {
    dirty = false;
    lastUpdate = Date.now();
  }
  if (
    ((Config.display.screenOffTimeout * 60000) - (Date.now() - lastUpdate) > 0)
    || (lastUpdate === 0) 
    || state.running
  ) {
    await render();
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
};

const isUpdated = (savedState: ISharedState, newState: ISharedState): boolean => {
  const newMenu = newState.menu?.[newState.menu?.length];
  const savedMenu = savedState.menu?.[savedState.menu?.length];

  return (
    (newState.sp !== savedState?.sp)
    || (newState.running !== savedState?.running)
    || (newState.tuning !== savedState?.tuning)
    || (newState.nocoil !== savedState?.nocoil)
    || (newState.mode !== savedState.mode)
    || (newState.menu?.length !== savedState.menu?.length)
    || (newMenu?.current !== savedMenu?.current)
    || (newMenu?.action !== savedMenu?.action)
  );
};

export const setDisplayState = async (newState: ISharedState): Promise<void> => {
  dirty = true;
  const savedState = {...(state || {})};
  state = {
    ...(state || {}),
    ...newState
  };
  if (isUpdated(savedState, newState)) {
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
};

export const closeDisplay = (): void => {
  display.clearScreen();
  display.refresh();
  display.turnOff();
  display.dispose();
};

const renderHome = () => {
  display.setFont(Font.UbuntuMono_14ptFontInfo);
  const timer = (Config.e5cc.autoShutoff * 60000) - (Date.now() - (state.started || 0));
  if (state.running && timer >= 0) {
    drawBitmap(0, 0, getHourglass());
    display.drawString(18, 2, getTimeString(timer), 1, Color.White, Layer.Layer0);
  } else {
    drawBitmap(0, 0, Icons.clock);
    display.drawString(18, 2, dayjs(Date.now()).format('h:mm'), 1, Color.White, Layer.Layer0);
  }

  display.setFont(Font.UbuntuMono_24ptFontInfo);
  updateScreenSaverPos(
    state.nocoil ? 50 : 64,
    state.nocoil ? 46 : 40
  );

  if (state.nocoil) {
    display.setFont(Font.UbuntuMono_16ptFontInfo);
    display.drawString(pos.x, pos.y, 'NO COIL', 1, Color.White, Layer.Layer0);
  } else {
    display.drawString(pos.x, pos.y, `${(state.pv || 0).toString().padStart(3)}F`, 1, Color.White, Layer.Layer0);
  }

  if (
    ((Config.display.screenSaverTimeout * 60000) - (Date.now() - screenSaverDisabled) > 0) 
    || (screenSaverDisabled === 0)
  ) {
    drawBitmap(0, 48, Icons.home);
  }

  display.refresh();
};

const renderPresets = () => {
  display.setFont(Font.UbuntuMono_14ptFontInfo);
  const timer = (Config.e5cc.autoShutoff * 60000) - (Date.now() - (state.started || 0));
  if (state.running && timer >= 0) {
    drawBitmap(0, 0, getHourglass());
    display.drawString(18, 2, getTimeString(timer, false), 1, Color.White, Layer.Layer0);
  } else {
    drawBitmap(0, 0, Icons.clock);
    display.drawString(18, 2, dayjs(Date.now()).format('h:mm'), 1, Color.White, Layer.Layer0);
  }

  display.drawString(90, 2, `${presets[state.currentPreset || 0]}F`, 1, Color.White, Layer.Layer0);

  display.setFont(Font.UbuntuMono_24ptFontInfo);
  updateScreenSaverPos(
    state.nocoil ? 50 : 64,
    state.nocoil ? 46 : 40
  );

  if (state.nocoil) {
    display.setFont(Font.UbuntuMono_16ptFontInfo);
    display.drawString(pos.x, pos.y, 'NO COIL', 1, Color.White, Layer.Layer0);
  } else {
    display.drawString(pos.x, pos.y, `${(state.pv || 0).toString().padStart(3)}F`, 1, Color.White, Layer.Layer0);
  }

  if (
    ((Config.display.screenSaverTimeout * 60000) - (Date.now() - screenSaverDisabled) > 0) 
    || (screenSaverDisabled === 0)
  ) {
    drawBitmap(0, 48, Icons.star);
  }
  // display.drawString()
  // drawMenu(state.currentPreset || 0, presets.map(p => p.toString()), Icons.drop, 106);

  display.refresh();
};

const renderProfiles = () => {
  const menu = state.menu?.[state.menu?.length-1];
  if (!menu) {
    return;
  }

  drawMenu(menu.current, menu.menuItems, menu.icon);
  display.refresh();
};

const renderScripts = () => {
  const menu = state.menu?.[state.menu?.length-1];
  if (!menu) {
    return;
  }
  drawMenu(menu.current, menu.menuItems, Icons.code_16x16);
  display.refresh();
};

const renderSettings = async (): Promise<void> => {

  const menu = state.menu?.[state.menu?.length-1];
  if (!menu) {
    return;
  }

  if (menu.action === 'network') {
    display.setFont(Font.UbuntuMono_8ptFontInfo);    
    display.drawString(0, 2, `Mode: ${networkInfo?.network?.mode || ''}`, 1, Color.White, Layer.Layer0);
    display.drawString(0, 10, `SSID: ${networkInfo?.network?.ssid || ''}`, 1, Color.White, Layer.Layer0);
    display.drawString(0, 20, `IP:   ${networkInfo?.network?.address || ''}`, 1, Color.White, Layer.Layer0);
    drawStringWrapped(0, 30, `URL:  ${getUrl()}`, Font.UbuntuMono_8ptFontInfo, 6);
    display.refresh();
    return;
  }

  drawMenu(menu.current, menu.menuItems, menu.icon);
  display.refresh();
};

const render = async () => {
  if (state.showMessage) {
    return;
  }

  if (state.tuning) {
    renderTuning();
    return;
  }

  display.clearScreen();

  if (!state) {
    return;
  }

  if (state.loading) {
    display.clearScreen();
    const width = (state.loadingMessage?.length || 0) * 7;
    display.drawString(64 - Math.ceil(width / 2), 16, state.loadingMessage || '', 1, Color.White, Layer.Layer0);
    drawBitmap(56, 30, getHourglass());
    display.refresh();
    return;
  }

  if (state.prompt) {
    renderPrompt(display);
    return;
  }

  if (state.textinput) {
    renderTextInput(display);
    return;
  }

  if (state.numberinput) {
    renderNumberInput(display);
    return;
  }

  if (state.scriptRunning) {
    await renderRunningScript(display);
    return;
  }

  if (showPasscode && (state.passcode?.length || 0) > 0) {
    display.setFont(Font.UbuntuMono_14ptFontInfo);
    drawBitmap(0, 42, Icons.lock);
    display.drawString(20, 40, state.passcode || '', 1, Color.White, Layer.Layer0);
    display.refresh();
    return;
  }  

  //state.mode?
  switch (state.mode) {
  case 'profiles': {
    renderProfiles();
    break;
  }
  case 'settings': {
    await renderSettings();
    break;
  }
  case 'presets': {
    renderPresets();
    break;
  }
  case 'scripts': {
    renderScripts();
    break;
  }
  default: {
    renderHome();
    break;
  }
  }
};

const renderTuning = () => {
  display.clearScreen();
  drawMessage('Tuning ...', Font.UbuntuMono_12ptFontInfo);
  display.refresh();
};

export const updateScreenSaverPos = (startX: number, startY: number): boolean => {
  if (
    (
      ((Config.display.screenSaverTimeout * 60000) - (Date.now() - screenSaverDisabled) <= 0) 
      || (screenSaverDisabled === 0)
    ) 
    && !showPasscode
  ) {
    const newXDir = 
      pos.xDir === 1
        ? pos.x + pos.xDir > startX
          ? -1
          : 1
        : pos.x + pos.xDir < 0
          ? 1
          : -1;
    const newYDir = 
      pos.yDir === 1
        ? pos.y + pos.yDir > startY
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
    return true;
  } else {
    pos = {
      xDir: -1, yDir: -1,
      x: startX, y: startY,
      lastX: startX, lastY: startY,    
    };
    return false;
  }
};

const drawMenu = (selected: number, menuItems: string[], icon?: IIcon, fixedX?: number) => {
  if (icon) {
    drawBitmap(0, 48, icon);
  }
  const x = fixedX === undefined ? icon?.width || 0 : fixedX;
  let line = 0;
  display.setFont(Font.UbuntuMono_10ptFontInfo);
  const startPos = Math.max(0, selected - 4);
  let skip = 0;
  for (const item of menuItems) {
    if (skip < startPos) {
      skip++;
      continue;
    }
    if ((line + skip) === selected) {
      display.fillRect(x, 2 + (line * 11), 128-x, 11, Color.White, Layer.Layer0);
      display.drawString(x, 2 + (line * 11), item, 1, Color.Inverse, Layer.Layer0);
    } else {
      display.drawString(x, 2 + (line * 11), item, 1, Color.White, Layer.Layer0);
    }
    line++;
  }
};

export const drawStringWrapped = (x: number, y: number, text: string, font: Font, indent = 1, fixedWidth = 0, lineSpacing = 0): number => {
  // eslint-disable-next-line prefer-const
  let [ width, height ] = fontSize(font);
  if (lineSpacing !== 0) {
    height = lineSpacing;
  }
  const length = Math.floor((fixedWidth > 0 ? fixedWidth : 128)/width);
  let remainingText = text;
  let line = 0;
  const space = ' '.repeat(indent);
  while (remainingText !== space) {
    const value = remainingText.substr(0, length);
    remainingText = space + remainingText.substr(length);
    display.drawString(x, y + (line * height), value, 1, Color.White, Layer.Layer0);
    line++;
  }

  return line;
};

export const drawBitmap = ( xPos: number, yPos: number, { width, data }: { width: number, height: number, data: Uint8Array }): void => {
//  let s = '';
  for (let pos = 0; pos < data.length; pos++) {
    for (let c = 0; c < 8; c++) {
      if (((data[pos] >> (7 - c)) & 0b1) === 0b1) {
        //s += 'X';
        display.drawPixel(
          ((((pos % (width / 8)) * 8) + c) * 1) + xPos, 
          (Math.floor(pos / (width / 8)) * 1) + yPos, 
          Color.White, 
          Layer.Layer0);
      } 
      // else {
      //   s += ' ';
      // }
    }
    // if (pos % (width / 8) === 1) {
    //   s += '\n';
    // }
  }
  //console.log(s);
};

export const drawMessage = async (text: string, font: Font = Font.UbuntuMono_10ptFontInfo, icon?: string): Promise<void> => {
  let iconObj: IIcon | undefined = undefined;
  if (icon) {
    iconObj = (Icons as { [key: string]: IIcon })[icon];
    if (iconObj) {
      drawBitmap(Math.floor((128 - iconObj.width)/2), 64-iconObj.height, iconObj);
    }
  }

  display.setFont(font);
  const [ fontWidth, fontHeight ] = fontSize(font);
  const [ maxWidth, lines ] = getWrappedLines(text, font);
  const x = Math.floor((128 - (maxWidth * fontWidth))/2);
  const y = Math.floor((64.0 - (iconObj?.height || 0) - (lines.length * fontHeight)) / 2);
  let linePos = 0;
  for (const line of lines) {
    display.drawString(x, y + (linePos++ * fontHeight), line, 1, Color.White, Layer.Layer0);
  }
};

export const showMessage = async (text: string, font: Font = Font.UbuntuMono_10ptFontInfo, timeout = 3000): Promise<void> => {
  try {
    isMessage = true;
    setSharedState({
      showMessage: true,
    });
    display.clearScreen();
    await drawMessage(text, font);
    display.refresh();
    await new Promise(resolve => setTimeout(resolve, timeout));
  } finally {
    isMessage = false;
    setSharedState({
      showMessage: false,
    });
    display.refresh();
  }
};

export const getWrappedLines = (text: string, font: Font): [maxWidth: number, lines: string[]] => {
  const [ fontWidth ] = fontSize(font);
  const lines = Math.ceil((text.length * fontWidth) / 128);
  let remainingText = text;
  const charsPerLine = Math.floor(128 / fontWidth);
  const drawLines: string[] = [];
  if (lines > 1) {
    while (remainingText.length > 0) {
      if (remainingText.length < charsPerLine) {
        drawLines.push(...(remainingText.split('\n')));
        break;
      }

      let endingChar = charsPerLine;
      while ((endingChar !== 0) && (remainingText.charAt(endingChar) !== ' ') && (remainingText.charAt(endingChar) !== '\n')) {
        endingChar--;
      }
      if (endingChar === 0) {
        endingChar = charsPerLine;
      }

      const crPos = remainingText.indexOf('\n');
      if (crPos > 0 && crPos < endingChar) {
        endingChar = crPos;
      }
  
      const line = remainingText.substr(0, Math.min(endingChar, remainingText.length));
      remainingText = remainingText.substr(Math.min(endingChar, remainingText.length));  
      if (remainingText.length > 0 && (remainingText.startsWith('\n') || remainingText.startsWith(' '))) {
        remainingText = remainingText.substring(1);
      }
      drawLines.push(line);
    }
    const maxLineWidth = drawLines.reduce((previous, value) => {
      if (value.length > previous) {
        return value.length;
      }
      return previous;
    }, 0);
    return [maxLineWidth, drawLines];
  }
  return [text.length, [text]];
};

export const fontSize = (font: Font): [ width: number, height: number ] => (
  font === Font.UbuntuMono_8ptFontInfo
    ? [ 6, 10 ]
    : font === Font.UbuntuMono_10ptFontInfo
      ? [ 7, 11 ]
      : font === Font.UbuntuMono_12ptFontInfo
        ? [ 8, 14 ]
        : font === Font.UbuntuMono_14ptFontInfo
          ? [ 10, 16 ]
          : font === Font.UbuntuMono_16ptFontInfo
            ? [ 11, 19 ]
            : font === Font.UbuntuMono_24ptFontInfo
              ? [ 16, 28 ]
              : [ 31, 50 ]
);


init();
