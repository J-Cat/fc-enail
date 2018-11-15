import { IWpaCliStatus, IWpaScanResult } from 'wireless-tools';

export interface IMenuItem {
    readonly key: string;
    readonly title: string;
    readonly action?: string;
    readonly children?: IMenuItem[];
    readonly selectable: boolean;
    readonly maxAction?: number;
}

export interface IMenuState {
    readonly menu: IMenuItem;
    readonly currentMenu: string;
    readonly currentIndex: number;
    readonly currentCharacter: number;
    readonly passphrase: string;
    readonly top: number;
    readonly bottom: number;
    readonly max: number;
    readonly executing: boolean;
    readonly connecting: boolean;
    readonly actionStep: number;
    readonly networkInfo?: IWpaCliStatus;
    readonly scan: IWpaScanResult[];
}