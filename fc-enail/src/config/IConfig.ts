export interface IConfig {
    readonly privateKey: string;
    readonly publicKey: string;
    readonly jwtOptions: {
        readonly algorithm: string;
        readonly audience: string;
        readonly issuer: string;
        readonly subject: string;
    }
}