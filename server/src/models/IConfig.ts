export interface IConfig {
  autoShutoff: number;
  screenSaverTimeout: number;
  screenOffTimeout: number;
  max: number;
  min: number;
  volume: number;
  localtunnel?: string;
  startupSound?: string;
}
