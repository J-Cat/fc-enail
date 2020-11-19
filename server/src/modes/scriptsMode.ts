import { IModeInstance } from '../models/IModeInstance';
import { BaseMode } from './baseMode';

export const ScriptsMode: IModeInstance = {
  ...BaseMode,
  key: 'scripts',
} as IModeInstance;