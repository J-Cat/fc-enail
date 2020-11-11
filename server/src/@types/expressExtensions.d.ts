// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        authenticated: boolean;
    }
}

export {};
