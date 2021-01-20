import { exec as cpexec } from 'child_process';

export const exec = (cmd: string): Promise<{ error?: Error; stderr?: string; stdout?: string; }> => {
  return new Promise<{ error?: Error, stderr?: string, stdout?: string }>(resolve => {
    cpexec(cmd, { encoding: 'utf8' }, (error, stderr, stdout) => {
      console.log(`STDOUT = ${stdout}\n\nSTDERR = ${stderr}`);
      if (error) {
        resolve({ error: new Error(error.message) });
        return;
      }
      resolve({stderr, stdout});
    });
  });
};
