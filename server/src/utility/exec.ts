import { exec as cpexec } from 'child_process';

export const exec = async (cmd: string): Promise<{ error?: Error; stderr?: string; stdout?: string; }> => {
  const cp = cpexec(cmd);

  let stdout: string | undefined;
  cp.stdout?.on('data', data => {
    if (!stdout) {
      stdout = data;
    } else {
      stdout += data;
    }
  });

  let error: Error | undefined;
  cp.on('error', err => {
    error = err;
  });

  let stderr: string | undefined;
  cp.stderr?.on('data', data => {
    if (!stderr) {
      stderr = data;
    } else {
      stderr += '\n' + data;
    }
  });

  await new Promise<void>(resolve => {
    cp.stdout?.on('close', () => {
      resolve();
    });  
  });

  return { error, stderr, stdout };
};