import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import { exec } from 'child_process';
import { getSsids, setSsids } from '../utility/localDb';

export const getNetworkInfo = async (req: Request, res: Response): Promise<Response> => {
  return new Promise(resolve => {
    try {
      exec(
        ` \
          ACTIVE_DEVICE=$(nmcli --terse c show --active | sed -E 's/^([^:]+).*$/\\1/g'); \
          nmcli --terse --fields 802-11-wireless.mode,802-11-wireless.ssid c show $ACTIVE_DEVICE \
            | sed -E 's/^[^:]*:(.*)$/\\1/gi'; \
        `, 
        { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
          resolve(res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            error,
            stdout,
            stderr,
          }));
          return;
        }

        const [mode, ssid] = stdout?.split('\n').filter(s => s.length > 0) || [];
        if (!mode || !ssid) {
          throw new Error('Failed to retrieve network information.');
        }
        const ssids = getSsids();
        resolve(res.status(HttpStatusCode.OK).json({ mode, ssid, ssids }));
      });
    } catch (e) {
      const err: Error = e as Error;

      resolve(
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: err.message, error: { message: err.message, stack: err.stack } })
      );
    }
  })
}

export const scan = async (req: Request, res: Response): Promise<Response> => {
  return new Promise(resolve => {
    try {
      exec(
        ` \
          ACTIVE_IF=$(nmcli --terse c show --active | sed -E 's/^([^:]+).*$/\\1/g'); \
          sudo nmcli c down $ACTIVE_IF > /dev/null 2>&1; \
          nmcli --terse d wifi list | sed -E 's/^[^:]*:?([^:]+).*$/\\1/g' | grep -v -e '^ *$' | sort | uniq; \
          sudo nmcli c up $ACTIVE_IF > /dev/null 2>&1; \
        `, 
        { encoding: 'utf8' }, async (error, stdout, stderr) => {
        if (error) {
          resolve(res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            error,
            stdout,
            stderr,
          }));
          return;
        }

        const ssids = stdout?.split('\n').filter(s => s.length > 0) || [];
        await setSsids(ssids);
        resolve(res.status(HttpStatusCode.OK).json(ssids));
      });
    } catch (e) {
      const err: Error = e as Error;

      resolve(
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: err.message, error: { message: err.message, stack: err.stack } })
      );
    }
  })
}

export const updateNetwork = async (req: Request, res: Response): Promise<Response> => {
  return new Promise(resolve => {
    try {
      const mode = req.body.mode;
      const ssid = req.body.ssid;
      const passcode = req.body.passcode;
      let cmd = '';
      if (mode === 'infrastructure') {
        cmd = ` \
          set +e; \
          IFNAME=$(nmcli --terse c show --active | sed -E 's/^([^:]+).*$/\\1/g'); \
          if [ ! -z "$IFNAME" ]; \
            then sudo nmcli c down $IFNAME; \
          fi; \
          sudo nmcli c modify wifi-wlan0 \
            802-11-wireless.ssid "${ssid}" \
            802-11-wireless-security.psk "${passcode}"; \
          sudo nmcli c up wifi-wlan0; \
          if [ $? -ne 0 ]; then \
            sudo nmcli c up Hotspot; \
            set -e \
            echo "An error occured connecting to the $SSID network." 1>&2; \
            exit 1 \
          fi; \
          set -e; \
        `;
      } else {
        cmd = `
          set +e; \
          IFNAME=$(nmcli --terse c show --active | sed -E 's/^([^:]+).*$/\\1/g'); \
          if [ ! -z "$IFNAME" ]; then \
            sudo nmcli c down $IFNAME; \
          fi; \
          sudo nmcli c modify Hotspot \
            802-11-wireless.ssid "${ssid}" \
            802-11-wireless-security.psk "${passcode}"; \
          sudo nmcli c up Hotspot; \
          if [ $? -ne 0 ]; then \
            if [ ! -z "$IFNAME" ]; then \
              sudo nmcli c up $IFNAME; \
            fi; \
            set -e \
            echo "An error occured starting the access point." 1>&2; \
            exit 1; \
          fi; \
          set -e; \
        `;
      }
      exec(
        cmd,
        { encoding: 'utf8' }, (error, stdout, stderr) => {
          resolve(res.status(HttpStatusCode.OK).json({
            error,
            stdout,
            stderr,
          }));
        }
      );
    } catch (e) {
      const err: Error = e as Error;

      resolve(
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: err.message, error: { message: err.message, stack: err.stack } })
      );
    }
  })
}