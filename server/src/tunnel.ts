import localtunnel from 'localtunnel';
import { registerConfigChange } from './config';
import { getUrl, setUrl } from './dao/localDb';
import { parseIntDefault } from './utility/parseIntDefault';
import { setSharedState } from './dao/sharedState';

let Config = registerConfigChange('localtunnel', newConfig => {
  Config = newConfig;
});

export const initTunnel = async (): Promise<localtunnel.Tunnel | undefined> => {
  try {
    if (!Config.localtunnel.subdomain) {
      return;
    }

    await new Promise<localtunnel.Tunnel>((resolve, reject) => {
      try {
        setTimeout(() => { reject('Connection to localtunnel.me timed out.'); }, 10000);

        localtunnel({ 
          port: parseIntDefault(process.env.API_PORT, 8000),
          subdomain: Config.localtunnel.subdomain, 
          allow_invalid_cert: true,  
        }).then(tunnel => {
          console.log(`localtunnel.me URL: ${tunnel.url}`);
          setSharedState({ url: tunnel.url }, 'self').then(() => {
            if (getUrl() !== tunnel.url) {
              setUrl(tunnel.url).then(() => {
                resolve(tunnel);
              });
            } else {
              resolve(tunnel);  
            }
          });
        }).catch(reason => {
          reject(reason);
        });
      } catch (e) {
        reject(e);        
      }
    });

    // don't need to send e-mail with localtunnel, just NGROK
    //   if (Config.email.address?.length && Config.email.sendgridApiKey?.length) {
    //     try {
    //       mail.setApiKey(Config.email.sendgridApiKey);
    //       await mail.send({
    //         from: Config.email.from || 'fcenail@jcatvapes.com',
    //         to: Config.email.address,
    //         subject: 'New FC-Enail URL',
    //         text: `Your new FC-Enail public URL is: ${tunnel.url}`,
    //       });
    //     } catch (e) {
    //       console.error(`An error occurred sending the localtunnel.me to your e-mail address (${Config.email.address}): ${e.message}`);
    //     }
    //   }
    // }
  } catch (e) {
    console.error(`An error occurred connecting to localtunnel.me: ${e.message}`);
  }
};