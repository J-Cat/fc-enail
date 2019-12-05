import { IE5CCOptions } from '../e5cc/IE5ccOptions';

export interface IConfig {
    readonly options: {
        readonly monitorCycleTime: number;
        readonly displayRefreshRate: number;
        readonly click: {
            readonly medium: number;
            readonly long: number;
            readonly reallyLong: number;
        }
        readonly httpPort: number;
        readonly httpsPort: number;
        readonly httpsPrivateKey: string;
        readonly httpsPublicKey: string;
        readonly mDNSName: string;
        readonly hardware: {
            readonly oled: {
                readonly address: number;
            }
            readonly button: {
                readonly pin: number;
                readonly debounce: number;
            }
            readonly dial: {
                readonly A: number;
                readonly B: number;
                readonly C: number;
                readonly messageThrottle: number;
                readonly rotationThrottle: number;
                readonly rotationAccelerationExpires: number;
                readonly rotationAccelerationThreshold: number;
                readonly rotationMaxStep: number;
                readonly rotationFixedStep: number;
                readonly rotationDebounce: number;
                readonly buttonDebounce: number;
            }
        };
        readonly e5cc: IE5CCOptions;
    };
    readonly files: {
        readonly scripts: string;
        readonly savedState: string;
        readonly savedProfiles: string;
    };
    readonly security: {
        readonly tokenTitle: string;
        readonly privateKey: string;
        readonly publicKey: string;
        readonly tempWPASupplicant: string;
    }
    readonly jwtOptions: {
        readonly algorithm: string;
        readonly audience: string;
        readonly issuer: string;
        readonly subject: string;
    };
    readonly inputCharacters: string;
}