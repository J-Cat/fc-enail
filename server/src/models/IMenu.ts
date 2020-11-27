import { IIcon } from './icons';

export interface IMenu {
  current: number;
  min: number;
  max: number;
  action?: string;
  menuItems: string[];
  icon?: IIcon;
  isMoving?: boolean;
  onClick: (index: number, action?: string) => Promise<void>;
  onLongClick?: (index: number) => Promise<void>;
  onMove?: () => Promise<void>;
}