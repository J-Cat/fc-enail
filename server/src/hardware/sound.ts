import { exec } from 'child_process'
import { Sounds } from '../models/sounds';

export const playSound = async (filename: string): Promise<{error?: Error, stderr?: string}> => {
  exec(`aplay "./sounds/${filename}"`, (error, stdout, stderr) => {
    if (error) {
      return {
        error: new Error(error.message),
        stderr,
      };
    }
  })
  return {};
}

(async () => {
  const result = await playSound(Sounds.appear);
  if (result.error) {
    console.error(result.stderr);
  }
})();
