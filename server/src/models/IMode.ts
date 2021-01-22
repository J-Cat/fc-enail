export interface IMode {
  key: string;
  onClick: () => Promise<void>;
  onEncoderClick: () => Promise<void>;
  onEncoderLongClick: () => Promise<void>;
  onEncoderChange: (increment: number) => Promise<void>;
  onLongClick?: () => Promise<void>;
  onReallyLongClick?: () => Promise<void>;
  onReallyReallyLongClick?: () => Promise<void>;
}