declare module 'wireless-tools' {
    interface IWpaCliStatus {
        readonly bssid: string;
        readonly frequency: number;
        readonly mode: string;
        readonly key_mgmt: string;
        readonly ssid: string;
        readonly pairwise_cipher: string;
        readonly group_cipher: string;
        readonly p2p_device_address: string;
        readonly wpa_state: string;
        readonly ip: string;
        readonly mac: string;
        readonly uuid: string;
        readonly id: number;
    }

    interface IWpaScanResult {
        readonly bssid: string;
        readonly frequency: number;
        readonly signalLevel: number;
        readonly flags: string;
        readonly ssid: string;
    }

    interface IWpaConnectionOptions {
        readonly interface: string;
        readonly ssid: string;
        readonly passphrase: string;
        readonly driver: string;
    }

    class wpa {
        static status: (interface: string, callback: (err: Error, status: IWpaCliStatus) => void) => void;
        static scan: (interface: string, callback: (err: Error) => void) => void;
        static scan_results:(interface: string, callback: (err: Error, results: IWpaScanResult[]) => void) => void;
    }

    class wpa_supplicant {
        static enable: (options: IWpaConnectionOptions, callback: (err: Error) => void) => void;
        static disable: (interface: string, callback: (err: Error) => void) => void;
        static exec: (interface: string, callback: (err: Error) => void) => void;
    }

}