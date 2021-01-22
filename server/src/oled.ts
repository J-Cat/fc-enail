import { Font, display, Color, Layer } from 'ssd1306-i2c-js';
import { program } from 'commander';
import { parseIntDefault } from './utility/parseIntDefault';

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

const init = async (): Promise<void> => {
  display.init(1, 60);
  display.turnOn();
  display.setFont(Font.UbuntuMono_24ptFontInfo);
  display.clearScreen();
  display.refresh();  
};

const getFontFromSize = (size: number): Font => {
  switch (size) {
  case 8: return Font.UbuntuMono_8ptFontInfo;
  case 12: return Font.UbuntuMono_12ptFontInfo;
  case 14: return Font.UbuntuMono_14ptFontInfo;
  case 16: return Font.UbuntuMono_16ptFontInfo;
  case 24: return Font.UbuntuMono_24ptFontInfo;
  case 48: return Font.UbuntuMono_48ptFontInfo;
  default: return Font.UbuntuMono_10ptFontInfo;
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

init();

program
  .option('-c, --clear', 'Clear display.')
  .option('-w, --write <text>', 'Write text to display.')
  .option('-x, --x <value>', 'Starting x position')
  .option('-y, --y <value>', 'Startying y position')
  .option('-f, --font <size>', 'Font size (8, 10, 12, 14, 16, 24, 48). Default 10.');

program.parse(process.argv);
const options = program.opts();

if (options.clear) {
  display.clearScreen();
  display.refresh();
}

if (options.write) {
  drawStringWrapped(
    parseIntDefault(options.x, 0), 
    parseIntDefault(options.y, 0),
    options.write,
    getFontFromSize(parseIntDefault(options.font, 10)),
  );
  display.refresh();
}

display.dispose();