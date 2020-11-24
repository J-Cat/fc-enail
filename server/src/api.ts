import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import nocache from 'nocache';
import logger from 'morgan';
import { Server, createServer } from 'https';
import bodyParser from 'body-parser';
import path from 'path';
import HttpStatusCode from 'http-status-codes';
import { validateToken } from './controllers/authController';
import { authRoute } from './routes/authRoute';
import { networkRoute } from './routes/networkRoute';
import { stateRoute } from './routes/stateRoute';
import { configRoute } from './routes/configRoute';
import { profileRoute } from './routes/profileRoute';
import { parseIntDefault } from './utility/parseIntDefault';
import { scriptRoute } from './routes/scriptRoute';

export const Api = (port = 8000, baseRoutePath = ''): Server => {
  // initialize configuration environment
  const config = () => {
    port = parseIntDefault(process.env.API_PORT, 8000);
    baseRoutePath = process.env.API_BASE_ROUTE_PATH || '';
  };

  // Configure Express middleware.
  const middleware = (app: Application) => {
    // Express middleware
    app.set('etag', false);
    app.use(helmet({
      contentSecurityPolicy: false,
    }));
    app.use(nocache());
    app.use(cors({
      allowedHeaders: [
        'Content-Type', 'Authorization',
      ],
    }));
    app.use(logger('dev'));
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ extended: true }));
  };

  // static files (client)
  const serveStatic = (app: Application) => {
    app.use('/client', express.static(process.env.API_CLIENT_PATH || path.join(__dirname, 'client'))); 
    app.use('/client', (req, res) => {
      const filePath = process.env.API_CLIENT_PATH
        ? path.resolve(path.join(process.env.API_CLIENT_PATH, 'index.html'))
        : path.join(__dirname, 'client/index.html');
      res.sendFile(filePath);
    });
  };

  // token/auth middleware
  const verifyToken = (app: Application) => {
    // we can hit these paths without actually authenticating
    app.use(`${baseRoutePath}/auth`, authRoute);

    // // route middleware to verify a token
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      // redirect root to client app
      if (req.url === '/') {
        res.redirect('/client');
        return;
      }

      // always resolve service worker
      if (req.url.endsWith('/service-worker.js')) {
        const url = path.join(
          process.env.API_CLIENT_PATH || path.join(__dirname, '../client'), 
          'service-worker.js'
        );

        res.sendFile(path.resolve(url));
        return;
      }

      // check header or url parameters or post parameters for token
      const authToken: string = req.body.token || req.query.token || req.headers.authorization;

      validateToken(authToken)
        .then((result) => {
          if (result.success) {
            req.authenticated = true;
            next();
          } else {
            res.status(HttpStatusCode.FORBIDDEN)
              .send(result.message);
          }
        })
        .catch((result) => {
          res.status(HttpStatusCode.FORBIDDEN)
            .send(result.message);
        });

    });

  };

  // Configure API endpoints.
  const routes = (app: Application) => {
    app.use(`${baseRoutePath}/network`, networkRoute);
    app.use(`${baseRoutePath}/state`, stateRoute);
    app.use(`${baseRoutePath}/config`, configRoute);
    app.use(`${baseRoutePath}/profiles`, profileRoute);
    app.use(`${baseRoutePath}/scripts`, scriptRoute);

    // catch 404 and forward to error handler
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      const err: Error = new Error('The resource you have requested was not found!');
      err.status = HttpStatusCode.NOT_FOUND;
      next(err);
    });

    // app.use(logErrors);

    // return error to user
    app.use((err: Error, req: express.Request, res: express.Response) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(err.stack);
      }
      res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: err.message,
          success: false,
        });
    });
  };

  const listen = (server: Server) => {
    if (!server) {
      console.error('Server object is NULL.  Failed to start listening.');
      process.exit(1);
    }

    server.listen(port, () => {
      console.log('Running server on port %s', port);
    });
  };

  const handleExceptions = () => {
    (process as NodeJS.EventEmitter).on('uncaughtException', (err: { code: string; message: string }) => {
      if (err.code === 'ECONNRESET') {
        console.log(err.message);
      } else {
        throw err;
      }
    });
  };

  // initialize 
  config();

  const app: Application = express();
  middleware(app);
  serveStatic(app);
  verifyToken(app);
  routes(app);

  const server = createServer({ cert: process.env.API_JWT_PUBLIC_CERT, key: process.env.API_JWT_PRIVATE_KEY }, app);
  listen(server);

  handleExceptions();

  return server;
};


