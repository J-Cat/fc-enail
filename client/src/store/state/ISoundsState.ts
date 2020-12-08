import { ISounds } from '../../models/ISounds';

export interface ISoundsState {
  readonly loaded: boolean;
  readonly loading: boolean;
  readonly requesting: boolean;
  readonly error?: string;
  readonly sounds: ISounds;
}