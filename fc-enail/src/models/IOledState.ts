import { EnailMode } from './IEnailState';
import { IWpaCliStatus } from 'wireless-tools';
import { IMenuItem } from './IMenuState';

export interface IOledState {
    readonly mode: EnailMode;
    readonly currentMenu: string;
    readonly menuTop: number;
    readonly menuBottom: number;
    readonly selectedIndex: number;
    readonly isPassphrase: boolean;
    readonly passphrase: string;
    readonly input: string;
    readonly scriptTitle: string;
    readonly scriptRunning: boolean;
    readonly scriptStartTime: number;
    readonly actionStep: number;
    readonly stepMessage?: string;
    readonly executing: boolean;
    readonly icon: string;
    readonly flashRate: number;
    readonly networkInfo?: IWpaCliStatus;
    readonly availableNetworks: string[]; 
    readonly menu: IMenuItem;
    readonly lastUpdated: number;
    readonly setPoint: number;
    readonly presentValue: number;
    readonly running: boolean;
    readonly runningSince: number;
    readonly autoShutoff: number;
}
