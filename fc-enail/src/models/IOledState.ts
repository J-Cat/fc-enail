import { EnailMode } from './IEnailState';

export interface IOledState {
    readonly lines: string[];
    readonly icon: string;
    readonly flashRate: number;
    readonly selectedIndex: number;
    readonly selectedMenu: number;
    readonly executing: boolean;
    readonly mode: EnailMode;
    readonly isPassphrase: boolean;
}
