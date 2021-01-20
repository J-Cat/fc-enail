import { exec as cpexec } from 'child_process';

export const exec = async (cmd: string): Promise<{ error?: Error; stderr?: string; stdout?: string; }> => {
  return new Promise<{ error?: Error, stderr?: string, stdout?: string }>(resolve => {
    cpexec(cmd, (error, stderr, stdout) => {
      if (error) {
        resolve({ error: new Error(error.message) });
        return;
      }
      resolve({stderr, stdout});
    });
  });
};
