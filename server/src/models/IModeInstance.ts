export interface IModeInstance {
  key: string;
  onClick: () => Promise<void>;
  onLongClick?: () => Promise<void>;
  onEncoderClick: () => Promise<void>;
  onEncoderChange: (value: number) => Promise<void>;
}