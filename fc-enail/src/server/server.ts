import * as express from 'express';
import { Server as HttpServer } from 'http';
import * as SocketIO from 'socket.io';
import * as bodyParser from "body-parser";
import * as cors from 'cors';
import { createAdvertisement, ServiceType } from 'mdns';

import { EnailRoute } from '../routes/enailRoute';
import * as Constants from '../models/constants';

import store from '../store/createStore';
import { IEnailEmitState } from '../models/IEnailEmitState';

import Debug from 'debug';
const debug = Debug('fc-enail:server');

export const HTTP_PORT = 4000;

export class Server {
    app!: express.Application;
    http!: HttpServer;
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

        this.http = new HttpServer(this.app);
        this.io = SocketIO(this.http);

        this.configureRoutes();
        this.initSocketIo();
        this.start();
        // this.dispatch(socketConnected(this.io));
    }

    configureRoutes = () => {
        const enailRoute = new EnailRoute();
        this.app.use('/', enailRoute.router);

        // const securityRoute = new Security(this.getState, this.dispatch);
        // this.app.use('/auth', securityRoute.router);
        // this.app.use('/', passport.authenticate('jwt', { session: false }), monitorRoute.router);
    }

    initSocketIo = () => {
    }

    start = () => {
        debug('starting');
        this.http.listen(HTTP_PORT);

        // advertise an HTTP server on port 3000
        createAdvertisement(new ServiceType('_fc-enail', '_tcp'), HTTP_PORT, {
            name: 'FC Community E-Nail'
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
}

const server = new Server();
export default server;