import { exec } from './exec';

export interface ISystemdStatus {
  name: string;
  state: string;
  isActive: boolean;
  timestamp: string;
  isDisabled: boolean;
};

export const systemdStatus = async (serviceName: string): Promise<ISystemdStatus|void> => {
  try {
    const { error, stderr, stdout } = await exec(`systemctl show ${serviceName} -p Id -p ActiveState -p SubState -p UnitFileState -p StateChangeTimestamp`);
    if (error) {
      console.error(stderr);
      throw error;
    }

    if (!stdout) {
      console.error(`No output returned while retrieving service status: ${serviceName}`);
      throw new Error('No output from service status.');
    }

    const values: { [key: string]: string|boolean } = {};
    for (const line of stdout.split('\n')) {
      const [key, value] = line.split('=');
      if (key && value) {
        values[key] = value;
      }
    }

    return {
      name: values['Id'] as string,
      state: values['SubState'] as string,
      timestamp: values['StateChangeTimestamp'] as string,
      isActive: values['ActiveState'] as string === 'active',
      isDisabled: values['UnitFileState'] as string !== 'enabled',
    };
        
  } catch (e) {
    console.error(e);
    return;
  }

};
