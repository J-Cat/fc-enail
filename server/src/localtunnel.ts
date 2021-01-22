import dotenv from 'dotenv';
import localtunnel from 'localtunnel';
// import mail from '@sendgrid/mail';
import { registerConfigChange } from './config';
import { initLocalDb, getUrl, setUrl } from './dao/localDb';

let Config = registerConfigChange('localtunnel', newConfig => {
  Config = newConfig;
});

let tunnel: localtunnel.Tunnel | undefined;

export const initTunnel = async (): Promise<void> => {
  dotenv.config();

  await initLocalDb();

  try {
    if (!Config.localtunnel.subdomain) {
      return;
    }

    tunnel = await new Promise<localtunnel.Tunnel>((resolve, reject) => {
      try {
        setTimeout(() => { reject('Connection to localtunnel.me timed out.'); }, 10000);

        resolve(localtunnel({ 
          port: 80,
          subdomain: Config.localtunnel.subdomain, 
          allow_invalid_cert: true,  
        }));
      } catch (e) {
        reject(e);        
      }
    });

    console.log(`localtunnel.me URL: ${tunnel.url}`);

    if (getUrl() !== tunnel.url) {
      await setUrl(tunnel.url);
    }

    // if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.length
    //   && process.env.EMAIL_FROM && process.env.EMAIL_TO && process.env.SUBJECT) {
    //   try {
    //     mail.setApiKey(process.env.SENDGRID_API_KEY);
    //     await mail.send({
    //       from: process.env.EMAIL_FROM,
    //       to: process.env.EMAIL_TO,
    //       subject: process.env.SUBJECT,
    //       text: `Your new public URL for your Heater Control is: ${tunnel.url}`,
    //     });
    //   } catch (e) {
    //     console.error(`An error occurred sending the localtunnel.me to your e-mail address (${process.env.EMAIL_TO}): ${e.message}`);
    //   }
    // }
  } catch (e) {
    console.error(`An error occurred connecting to localtunnel.me: ${e.message}`);
  }
};

initTunnel();

process.stdin.resume();//so the program will not close instantly

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