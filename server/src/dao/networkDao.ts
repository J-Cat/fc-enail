/* eslint-disable quotes */
import { exec } from '../utility/exec';
import { getSsids, setSsids } from './localDb';

export const getNetworkInfo = async (): Promise<{ error?: string, stdout?: string, stderr?: string, network?: { mode: string, ssid: string, address: string, ssids: string[] }}> => {
  const { error, stderr, stdout } = await exec(
    ` \
      ACTIVE_DEVICE=$(nmcli --terse c show --active | sed -E 's/^([^:]+).*$/\\1/g'); \
      nmcli --terse --fields 802-11-wireless.mode,802-11-wireless.ssid,ip4.address c show $ACTIVE_DEVICE \
        | sed -E 's/^[^:]*:(.*)$/\\1/gi'; \
    `
  );

  if (error) {
    return {
      error: error.message,
      stdout,
      stderr,
    };
  }

  if (!stdout) {
    return {};
  }

  const [mode, ssid, address] = stdout?.split('\n').filter(s => s.length > 0) || [];
  if (!mode || !ssid || !address) {
    throw new Error('Failed to retrieve network information.');
  }
  const ssids = getSsids();

  return { network: { mode, ssid, address, ssids } };
};

export const scan = async (): Promise<{error?: string, stdout?: string, stderr?: string, ssids?: string[]}> => {
  const { error, stderr, stdout } = await exec(
    `sudo iwlist wlan0 scan | grep ESSID: | sed -E 's/^.*ESSID:"([^"]*)".*/\\1/gi' | grep -v -e '^ *$' | sort | uniq`
  ); 

  if (error) {
    return {
      error: error.message,
      stdout,
      stderr,
    };
  }

  if (!stdout) {
    return { ssids: [] };
  }

  const ssids = stdout?.split('\n').filter(s => s.length > 0) || [];
  await setSsids(ssids);
  return { ssids };
};

export const updateNetwork = async (mode: 'ap'|'infrastructure', ssid: string, passcode: string): Promise<{ error?: string, stdout?: string, stderr?: string }> => {
  let cmd = '';
  if (mode === 'infrastructure') {
    cmd = ` \
          set +e; \
          sudo nmcli c modify wifi-wlan0 \
            802-11-wireless.ssid "${ssid}" \
            802-11-wireless-security.psk "${passcode}"; \
          IFNAME=$(nmcli --terse c show --active | sed -E 's/^([^:]+).*$/\\1/g'); \
          if [ ! -z "$IFNAME" ]; \
            then sudo nmcli c down $IFNAME; \
          fi; \
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
          sudo nmcli c modify Hotspot \
            802-11-wireless.ssid "${ssid}" \
            802-11-wireless-security.psk "${passcode}"; \
          IFNAME=$(nmcli --terse c show --active | sed -E 's/^([^:]+).*$/\\1/g'); \
          if [ ! -z "$IFNAME" ]; then \
            sudo nmcli c down $IFNAME; \
          fi; \
          if [ "$IFNAME" != "Hotspot" ]; then \
            sudo nmcli c down Hotspot; \
          fi; \
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
  const { error, stderr, stdout } = await exec(cmd);

  return {
    error: error?.message,
    stdout,
    stderr,
  };
};