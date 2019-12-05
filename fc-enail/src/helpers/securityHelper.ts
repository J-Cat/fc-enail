import { sign, verify, VerifyCallback, VerifyErrors } from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config';
import Debug from 'debug';

const debug = Debug('fc-enail:controller');

const TOKEN_TITLE = config.security.tokenTitle;

let privateKey: Buffer;
let publicKey: Buffer;

export const generateToken = () => {
    return new Promise<string>(resolve => {
        getPrivateKey().then((cert: Buffer) => {
            const token = sign({
                title: TOKEN_TITLE
            }, cert, config.jwtOptions);
    
            resolve(token);
        });    
    });
}

export const verifyToken = (token: string): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
        getPublicKey().then((cert: Buffer) => {
            verify(token, cert, config.jwtOptions, (err: VerifyErrors, decoded: any)  => {
                if (!err) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    });
}

const getPrivateKey = async () => {
    return new Promise<Buffer>((resolve, reject) => {
        if (privateKey) {
            resolve(privateKey);
            return;
        }

        fs.readFile(path.resolve(`${config.security.privateKey}`), {}, (err, cert) => {
            if (err) {
                debug('Error reading private key.');

                reject('Error reading private key.');
                return;
            }

            privateKey = cert;

            resolve(cert);
        });
    });
}

const getPublicKey = async () => {
    return new Promise<Buffer>((resolve, reject) => {
        if (publicKey) {
            resolve(publicKey);
            return;
        }

        fs.readFile(path.resolve(`${config.security.publicKey}`), {}, (err, cert) => {
            if (err) {
                debug('Error reading public key.');

                reject('Error reading public key.');
                return;
            }

            publicKey = cert;

            resolve(cert);
        });
    });
}
