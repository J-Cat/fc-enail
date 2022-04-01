import { initTunnel } from './localtunnel';

(async (): Promise<void> => {
  const tunnel = await initTunnel();

  const exitHandler = (options: { cleanup?: boolean; exit?: boolean }, exitCode?: number): void => {
    if (options.cleanup) {
      console.log('Cleaning up before exit.');
      tunnel?.close();
    }
    if (exitCode || exitCode === 0) {
      console.log(exitCode);
    }
    if (options.exit) {
      process.exit(exitCode);
    }
  };

  //do something when app is closing
  process.on('exit', exitHandler.bind(null,{cleanup:true}, 0));

  //catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, {exit:true}, 0));

  // CATCHES TERMINATE
  process.on('SIGTERM', exitHandler.bind(null, {exit:true}, 0));

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, {exit:true}, 1));
  process.on('SIGUSR2', exitHandler.bind(null, {exit:true}, 1));

  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, {exit:true}, 2));
})();

process.stdin.resume();//so the program will not close instantly
