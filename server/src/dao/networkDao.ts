/* eslint-disable quotes */
import { exec } from 'child_process';
import { getSsids, setSsids } from '../utility/localDb';

export const getNetworkInfo = async (): Promise<{ error?: string, stdout?: string, stderr?: string, network?: { mode: string, ssid: string, address: string, ssids: string[] }}> => {
  return new Promise(resolve => {
    try {
      exec(
        ` \
          ACTIVE_DEVICE=$(nmcli --terse c show --active | sed -E 's/^([^:]+).*$/\\1/g'); \
          nmcli --terse --fields 802-11-wireless.mode,802-11-wireless.ssid,ip4.address c show $ACTIVE_DEVICE \
            | sed -E 's/^[^:]*:(.*)$/\\1/gi'; \
        `, 
        { encoding: 'utf8' }, (error, stdout, stderr) => {
          if (error) {
            resolve({
              error: error.message,
              stdout,
              stderr,
            });
            return;
          }

          const [mode, ssid, address] = stdout?.split('\n').filter(s => s.length > 0) || [];
          if (!mode || !ssid || !address) {
            throw new Error('Failed to retrieve network information.');
          }
          const ssids = getSsids();
          resolve({ network: { mode, ssid, address, ssids } });
        });
    } catch (e) {
      resolve({ error: e.message });
    }
  });
};

export const scan = async (): Promise<{error?: string, stdout?: string, stderr?: string, ssids?: string[]}> => {
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
            resolve({
              error: error.message,
              stdout,
              stderr,
            });
            return;
          }

          const ssids = stdout?.split('\n').filter(s => s.length > 0) || [];
          await setSsids(ssids);
          resolve({ ssids });
        });
    } catch (e) {
      resolve({ error: e.message });
    }
  });
};

export const updateNetwork = async (mode: 'ap'|'infrastructure', ssid: string, passcode: string): Promise<{ error?: string, stdout?: string, stderr?: string }> => {
  return new Promise(resolve => {
    try {
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
            exit 1; \
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
          resolve({
            error: error?.message,
            stdout,
            stderr,
          });
        }
      );
    } catch (e) {
      resolve({ error: e.message });
    }
  });
};