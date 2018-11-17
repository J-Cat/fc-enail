import { IConfig } from './IConfig';

const configFile = require(`/home/pi/config.json`);
const config = configFile[process.env.NODE_ENV as string] as IConfig ||
    configFile["default"] as IConfig;

export { config };