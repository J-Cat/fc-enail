import localtunnel from 'localtunnel';
import { registerConfigChange } from './config';
import { getUrl, setUrl } from './utility/localDb';
import { parseIntDefault } from './utility/parseIntDefault';
import { setSharedState } from './utility/sharedState';

let Config = registerConfigChange(newConfig => {
  Config = newConfig;
});

export const initTunnel = async (): Promise<void> => {
  try {
    if (!Config.localtunnel.subdomain) {
      return;
    }

    const tunnel = await localtunnel({ 
      port: parseIntDefault(process.env.API_PORT, 8000),
      subdomain: Config.localtunnel.subdomain, 
      allow_invalid_cert: true,  
    });
    console.log(`localtunnel.me URL: ${tunnel.url}`);
    await setSharedState({ url: tunnel.url }, 'self');
    // if url changed, send e-mail
    if (getUrl() !== tunnel.url) {
      await setUrl(tunnel.url);
    }

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
}