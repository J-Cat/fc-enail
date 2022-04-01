import { ChildProcess, spawn } from 'child_process';
import { registerConfigChange } from './config';

let Config = registerConfigChange('remote-support', newConfig => {
  Config = newConfig;
});

// let encoderStart = 0;
// let gpioEncoder: Gpio | undefined;

let supportShell: ChildProcess | undefined = undefined;

export const toggleSupportShell = async (): Promise<string|void> => {
  if (supportShell !== undefined) {
    try {
      process.kill(-supportShell.pid);
    } catch (e) {
      console.error(e.message);
    }
    supportShell = undefined;
    return;
  }
  
  supportShell = spawn('tmate', ['-F'], { shell: true, detached: true });
  
  return new Promise<string>(resolve => {
    supportShell?.stdout?.on('data', (data?: string) => {
      const lines = data?.toString().split('\n') || [];
      for (const line of lines) {
        if (line.startsWith('ssh session: ')) {
          const sessionUrl = line.replace(/^ssh session: ssh (.*)$/gi, '$1');
          resolve(sessionUrl);
          return;
        }  
      }
    });  
  });

};

export const isSupportShellEnabled = (): boolean => {
  return supportShell !== undefined;
};

// export const startRemoteSupportMonitor = async (): Promise<void> => {
//   dotenv.config();

//   gpioEncoder = new Gpio(Config.encoder.S, 'in', 'both');

//   gpioEncoder.watch(async (error, value) => {
//     if (error) {
//       encoderStart = 0;
//       return;
//     }
//     if (value === 0) {
//       encoderStart = Date.now();
//     } else {
//       if (Date.now() - encoderStart > 8000) {
//         const result = await toggleSupportShell();
//         if (!result) {
//           console.log('Support session terminated.');
//           return;
//         }
//         console.log(`Remote support session URL: ${result}`);
//       }
//       encoderStart = 0;
//     }
//   });
// };

// startRemoteSupportMonitor();

// process.stdin.resume();//so the program will not close instantly

// const exitHandler = (options: { cleanup?: boolean; exit?: boolean }, exitCode?: number): void => {
//   if (options.cleanup) {
//     console.log('Cleaning up before exit.');
//     if (gpioEncoder) {
//       gpioEncoder.unwatchAll();
//     }

//   }
//   if (exitCode || exitCode === 0) {
//     console.log(exitCode);
//   }
//   if (options.exit) {
//     process.exit(exitCode);
//   }
// };

// //do something when app is closing
// process.on('exit', exitHandler.bind(null,{cleanup:true}, 0));

// //catches ctrl+c event
// process.on('SIGINT', exitHandler.bind(null, {exit:true}, 0));

// // CATCHES TERMINATE
// process.on('SIGTERM', exitHandler.bind(null, {exit:true}, 0));

// // catches "kill pid" (for example: nodemon restart)
// process.on('SIGUSR1', exitHandler.bind(null, {exit:true}, 1));

// process.on('SIGUSR2', exitHandler.bind(null, {exit:true}, 1));

// //catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, {exit:true}, 2));