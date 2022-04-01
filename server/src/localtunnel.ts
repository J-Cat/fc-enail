import dotenv from 'dotenv';
import localtunnel from 'localtunnel';
// import mail from '@sendgrid/mail';
import { registerConfigChange } from './config';
import { initLocalDb, getUrl, setUrl } from './dao/localDb';
import { exec } from './utility/exec';
import { ISystemdStatus, systemdStatus } from './utility/systemd-status';

let Config = registerConfigChange('localtunnel', newConfig => {
  Config = newConfig;
});

export const initTunnel = async (): Promise<localtunnel.Tunnel|void> => {
  dotenv.config();

  await initLocalDb();

  try {
    if (!Config.localtunnel.subdomain) {
      return;
    }

    const tunnel = await new Promise<localtunnel.Tunnel>((resolve, reject) => {
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

    return tunnel;

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

export const getTunnelStatus = async (): Promise<ISystemdStatus|void> => {
  const status = await systemdStatus('fcenail-localtunnel');
  return status;
};

export const toggleTunnelActive = async (): Promise<ISystemdStatus|void> => {
  const status = await getTunnelStatus();
  await exec(`sudo systemctl ${status?.isActive ? 'stop' : 'start'} fcenail-localtunnel.service`);
  return (await getTunnelStatus());
};

export const toggleTunnelEnabled = async (): Promise<ISystemdStatus|void> => {
  const status = await getTunnelStatus();
  await exec(`sudo systemctl ${status?.isDisabled ? 'enable' : 'disable'} fcenail-localtunnel.service`);
  return (await getTunnelStatus());
};
