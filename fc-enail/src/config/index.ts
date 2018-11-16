import { IConfig } from './IConfig';

const configFile = require(`./config.json`);
const config = configFile[process.env.NODE_ENV as string] ||
    configFile["default"] as IConfig;

export { config };