import * as express from 'express';
import * as fs from 'fs';
import { Server as HttpServer, createServer } from 'http';
//import { Server as HttpsServer, createServer } from 'https';
import * as SocketIO from 'socket.io';
import * as bodyParser from "body-parser";
import * as cors from 'cors';
import { createAdvertisement, ServiceType } from 'mdns';

import { EnailRoute } from '../routes/enailRoute';
import * as Constants from '../models/constants';

import store from '../store/createStore';
import { IEnailEmitState } from '../models/IEnailEmitState';

import Debug from 'debug';
import { verifyToken } from '../helpers/securityHelper';
import { config } from '../config';
const debug = Debug('fc-enail:server');

export const HTTP_PORT = config.options.httpPort;

export class Server {
    app!: express.Application;
    http!: HttpServer;
    // https!: HttpsServer;
    io!: SocketIO.Server;

    init = () => {
        this.app = express();

        const corsOptions = {
            origin: '*',
            allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
            methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
            optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
        }
        this.app.use(cors(corsOptions));
        this.app.use(bodyParser.json());

        this.http = createServer(this.app);
        
        // const privateKey  = fs.readFileSync(config.httpsPrivateKey, 'utf8');
        // const certificate = fs.readFileSync(config.httpsPublicKey, 'utf8');

        // this.https = createServer({
        //     key: privateKey,
        //     cert: certificate            
        // }, this.app);

        this.io = SocketIO(this.http);
        this.io.use(this.authorize);

        this.configureRoutes();
        this.initSocketIo();
        this.start();
        // this.dispatch(socketConnected(this.io));
    }

    configureRoutes = () => {
        const enailRoute = new EnailRoute();
        this.app.use('/', this.validateToken, enailRoute.router);

        // const securityRoute = new Security(this.getState, this.dispatch);
        // this.app.use('/auth', securityRoute.router);
        // this.app.use('/', passport.authenticate('jwt', { session: false }), monitorRoute.router);
    }

    validateToken = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
        if (['/', '/passphrase/generate', '/passphrase/verify'].indexOf(req.path.toLowerCase()) >= 0) {
            next();
            return;
        }

        let token = req.headers.authorization;
        
        if (!token) {
            res.sendStatus(401);
            return;
        }

        if (token.startsWith('Bearer ')) {
          // Remove Bearer from string
          token = token.slice(7, token.length);
        }
      
        verifyToken(token).then(result => {
            if (!result) {
                res.sendStatus(401);
            } else {
                next();
            }
        });
    }

    initSocketIo = () => {
    }

    start = () => {
        debug(`Starting FC Community E-Nail on ${HTTP_PORT}.`)
        this.http.listen(HTTP_PORT);

        // advertise an HTTP server on port 3000
        createAdvertisement(new ServiceType('_fc-enail', '_tcp'), config.options.httpPort, {
            name: config.options.mDNSName
        });
    }

    emitState = () => {
        if (!this.io) {
            return;
        }
        const state = store.getState().enail;
        const emitState: IEnailEmitState = {
            pv: state.presentValue,
            sp: state.setPoint,
            running: state.running,
            scriptRunning: state.scriptRunning,
            currentScript: state.currentScript ? state.currentScript.index : undefined,
            currentStep: state.currentStep ? state.currentStep.key : undefined,
            currentStepPos: state.currentStepPos,
            mode: state.mode
        };

        this.io.emit(Constants.EMIT_STATE, emitState);
    }

    authorize = (socket: SocketIO.Socket, next: (error?: Error) => void) => {
        if (socket.handshake.query && socket.handshake.query.token){
            verifyToken(socket.handshake.query.token).then(result => {
                if (result) {
                    next();
                } else {
                    next(new Error('Authentication failed.  Invalid token'));
                }
            });
        } else {
            next(new Error('Authentication token missing from request.'));
        }    
    };
}

const server = new Server();
export default server;