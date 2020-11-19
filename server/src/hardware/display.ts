import { Color, display, Font, Layer } from 'ssd1306-i2c-js';
import { registerConfigChange } from '../config';
import dayjs from 'dayjs';
import { Icons, IIcon } from '../models/icons';
import { ISharedState, registerStateChange } from '../utility/sharedState';
import { getNetworkInfo } from '../dao/networkDao';
import { Constants } from '../models/Constants';
import { getQuickSet } from '../utility/localDb';

let Config = registerConfigChange('display', newConfig => {
  Config = newConfig;
});

let presets: number[] = [];

let state = registerStateChange('oled', async (oldState, newState): Promise<void> => {
  setDisplayState(newState);
  if (oldState?.mode !== newState.mode && newState.mode === 'presets') {
    presets = getQuickSet();
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
  drawBitmap(32, 0, Icons.stealie);
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
  display.turnOff();
  display.dispose();
};

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
  );
  return `${h !== 0 ? `${h.toString()}:` : ''}${h === 0 ? m.toString() : m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const renderHome = () => {
  display.setFont(Font.UbuntuMono_12ptFontInfo);
  const timer = (Config.e5cc.autoShutoff * 60000) - (Date.now() - (state.started || 0));
  if (state.running && timer >= 0) {
    drawBitmap(0, 0, Icons.hourglass);
    display.drawString(18, 2, getTimeString(timer), 1, Color.White, Layer.Layer0);
  } else {
    drawBitmap(0, 0, Icons.clock);
    display.drawString(18, 2, dayjs(Date.now()).format('h:mma'), 1, Color.White, Layer.Layer0);
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
  display.setFont(Font.UbuntuMono_12ptFontInfo);
  const timer = (Config.e5cc.autoShutoff * 60000) - (Date.now() - (state.started || 0));
  if (state.running && timer >= 0) {
    drawBitmap(0, 0, Icons.hourglass);
    display.drawString(18, 2, getTimeString(timer), 1, Color.White, Layer.Layer0);
  } else {
    drawBitmap(0, 0, Icons.clock);
    display.drawString(18, 2, dayjs(Date.now()).format('h:mma'), 1, Color.White, Layer.Layer0);
  }

  display.drawString(90, 0, `${presets[state.currentPreset || 0]}F`, 1, Color.White, Layer.Layer0);

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
  display.clearScreen();
  drawMenu(0, ['Scripts', 'Script 1'], Icons.code_16x16);
  display.refresh();
};

const renderSettings = async (): Promise<void> => {

  const menu = state.menu?.[state.menu?.length-1];
  if (!menu) {
    return;
  }

  if (menu.action === 'network') {
    const networkInfo = await getNetworkInfo();
    display.setFont(Font.UbuntuMono_8ptFontInfo);    
    display.drawString(0, 2, `Mode: ${networkInfo.network?.mode}`, 1, Color.White, Layer.Layer0);
    display.drawString(0, 10, `SSID: ${networkInfo.network?.ssid}`, 1, Color.White, Layer.Layer0);
    display.drawString(0, 20, `IP:   ${networkInfo.network?.address}`, 1, Color.White, Layer.Layer0);
    drawStringWrapped(0, 30, `URL:  ${state.url}`, Font.UbuntuMono_8ptFontInfo, 6);
    display.refresh();
    return;
  }

  drawMenu(menu.current, menu.menuItems, menu.icon);
  display.refresh();
};

const render = async () => {
  if (isMessage) {
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
    drawBitmap(56, 30, Icons.hourglass);
    display.refresh();
    return;
  }

  if (state.prompt) {
    drawConfirm();
    return;
  }

  if (state.textinput) {
    const menu = state.menu?.[state.menu?.length-1];
    drawTextInput(menu?.action || ' ');
    return;
  }

  if (state.numberinput) {
    const menu = state.menu?.[state.menu?.length-1];
    drawNumberInput(menu?.action || ' ');
    return;
  }

  if (showPasscode && (state.passcode?.length || 0) > 0) {
    display.setFont(Font.UbuntuMono_14ptFontInfo);
    drawBitmap(0, 42, Icons.lock);
    display.drawString(20, 40, state.passcode || '', 1, Color.White, Layer.Layer0);
    display.refresh();
    return;
  }  

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

const updateScreenSaverPos = (startX: number, startY: number): boolean => {
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

const drawNumberInput = (label: string) => {
  if (state.numberinput?.value === undefined) {
    return;
  }

  display.setFont(Font.UbuntuMono_10ptFontInfo);
  const [labelFontWidth] = fontSize(Font.UbuntuMono_10ptFontInfo);
  const labelX = Math.floor((128 - (label.length * labelFontWidth)) / 2);
  display.drawString(labelX, 16, label, 1, Color.White, Layer.Layer0);

  display.setFont(Font.UbuntuMono_16ptFontInfo);
  const [fontWidth] = fontSize(Font.UbuntuMono_16ptFontInfo);
  const width = state.numberinput?.value.toString().length * fontWidth;
  if (width === 0) {
    return;
  }

  const x = Math.floor((128 - width) / 2);
  display.drawString(x, 29, state.numberinput?.value.toString(), 1, Color.White, Layer.Layer0);  
  display.refresh();
};

let flashState = false;
const drawTextInput = (label: string) => {
  display.setFont(Font.UbuntuMono_8ptFontInfo);
  display.drawString(0, 0, label, 1, Color.White, Layer.Layer0);
  display.drawString(
    0, 11, 
    `${state.textinput?.text}${flashState === true ? '_' : ' '}${'_'.repeat(128-(state.textinput?.text?.length || 0))}`, 
    1, Color.White, Layer.Layer0
  );

  const lines = Constants.textInput[state.textinput?.inputMode || 'lowercase'];
  const lineLength = Math.ceil(lines.length / 2);
  const startX = 6;

  drawStringWrapped(
    startX, 29, 
    lines,
    Font.UbuntuMono_8ptFontInfo, 
    0, 
    lineLength * 6,
    11
  );
  const charPos = lines.indexOf(state.textinput?.activeChar || '--');
  if (charPos >= 0) {
    const x = startX + (charPos * 6) - (charPos > lineLength ? (lineLength * 6) : 0);
    const y = 29 + (charPos >= lineLength ? 10 : 0);
    display.drawRect(x-1, y-1, 8, 12, Color.White, Layer.Layer0);
  }
  
  if (state.textinput?.activeChar === 'mode') {
    display.fillRect(0, 55, 36, 10, Color.White, Layer.Layer0);
  }
  display.drawString(
    0, 55, 
    state.textinput?.inputMode === 'lowercase' 
      ? 'upper'
      : state.textinput?.inputMode === 'uppercase'
        ? 'symbol'
        : 'lower', 
    1,
    state.textinput?.activeChar === 'mode' ? Color.Inverse : Color.White, 
    Layer.Layer0
  );

  if (state.textinput?.activeChar === 'del') {
    display.fillRect(38, 55, 18, 10, Color.White, Layer.Layer0);
  }
  display.drawString(38, 55, 'Del', 1, state.textinput?.activeChar === 'del' ? Color.Inverse : Color.White, Layer.Layer0);
  if (state.textinput?.activeChar === 'cancel') {
    display.fillRect(64, 55, 36, 10, Color.White, Layer.Layer0);
  }
  display.drawString(64, 55, 'Cancel', 1, state.textinput?.activeChar === 'cancel' ? Color.Inverse : Color.White, Layer.Layer0);
  if (state.textinput?.activeChar === 'ok') {
    display.fillRect(108, 55, 12, 10, Color.White, Layer.Layer0);
  }
  display.drawString(108, 55, 'Ok', 1, state.textinput?.activeChar === 'ok' ? Color.Inverse : Color.White, Layer.Layer0);
  display.refresh();
  flashState = !flashState;
};

const drawConfirm = () => {
  if (!state.prompt?.text) {
    return;
  }

  const [fontWidth, fontHeight] = fontSize(Font.UbuntuMono_10ptFontInfo);
  const [maxWidth, lines] = getWrappedLines(state.prompt?.text, Font.UbuntuMono_10ptFontInfo);
  
  const x = Math.floor((128 - (maxWidth * fontWidth))/2);
  let y = Math.floor((64 - (fontHeight * (lines.length + 2)))/2);
  let linePos = 0;
  for (const line of lines) {
    display.drawString(x, y + (linePos++ * fontHeight), line, 1, Color.White, Layer.Layer0);
  }
  y = y + (++linePos * fontHeight);
  const spaces = Math.max(Math.floor((maxWidth - 11)/2), 0);
  if (state.prompt.current) {
    display.fillRect(x+((spaces+9)*fontWidth), y, fontWidth * 2, fontHeight, Color.White, Layer.Layer0);
    display.drawString(x+(spaces*fontWidth), y, 'Cancel', 1, Color.White, Layer.Layer0);
    display.drawString(x+((spaces+9)*fontWidth), y, 'Ok', 1, Color.Black, Layer.Layer0);
  } else {
    display.fillRect(x+(spaces*fontWidth), y, fontWidth * 6, fontHeight, Color.White, Layer.Layer0);
    display.drawString(x+(spaces*fontWidth), y, 'Cancel', 1, Color.Black, Layer.Layer0);
    display.drawString(x+((spaces+9)*fontWidth), y, 'Ok', 1, Color.White, Layer.Layer0);
  }
  display.refresh();
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

const drawStringWrapped = (x: number, y: number, text: string, font: Font, indent = 1, fixedWidth = 0, lineSpacing = 0): number => {
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

const drawBitmap = ( xPos: number, yPos: number, { width, height, data }: { width: number, height: number, data: Uint8Array }) => {
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

export const drawMessage = async (text: string, font: Font = Font.UbuntuMono_10ptFontInfo): Promise<void> => {
  display.setFont(font);
  const [ fontWidth, fontHeight ] = fontSize(font);
  const [ maxWidth, lines ] = getWrappedLines(text, font);
  const x = Math.floor((128 - (maxWidth * fontWidth))/2);
  const y = Math.floor((64.0 - (lines.length * fontHeight)) / 2);
  let linePos = 0;
  for (const line of lines) {
    display.drawString(x, y + (linePos++ * fontHeight), line, 1, Color.White, Layer.Layer0);
  }
};

export const showMessage = async (text: string, font: Font = Font.UbuntuMono_10ptFontInfo, timeout = 5000): Promise<void> => {
  try {
    isMessage = true;
    display.clearScreen();
    await drawMessage(text, font);
    await new Promise(resolve => setTimeout(resolve, timeout));
  } finally {
    isMessage = false;
    display.refresh();
  }
};

const getWrappedLines = (text: string, font: Font): [maxWidth: number, lines: string[]] => {
  const [ fontWidth ] = fontSize(font);
  const lines = Math.ceil((text.length * fontWidth) / 128);
  let remainingText = text;
  const charsPerLine = Math.floor(128 / fontWidth);
  const drawLines: string[] = [];
  if (lines > 1) {
    while (remainingText.length > 0) {
      if (remainingText.length < charsPerLine) {
        drawLines.push(remainingText);
        break;
      }

      let endingChar = charsPerLine;
      while ((endingChar !== 0) && (remainingText.charAt(endingChar-1) !== ' ')) {
        endingChar--;
      }
      if (endingChar === 0) {
        endingChar = charsPerLine;
      }
  
      const line = remainingText.substr(0, Math.min(endingChar - 1, remainingText.length));
      remainingText = remainingText.substr(Math.min(endingChar, remainingText.length));  
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

const fontSize = (font: Font) => (
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
