import { Ioledjs } from 'ssd1306-i2c-js';

export interface IModeInstance {
  key: string;
  onClick: () => Promise<void>;
  onLongClick?: () => Promise<void>;
  onEncoderClick: () => Promise<void>;
  onEncoderLongClick: () => Promise<void>;
  onEncoderChange: (value: number) => Promise<void>;
  render?: (display: Ioledjs) => Promise<boolean>;
}