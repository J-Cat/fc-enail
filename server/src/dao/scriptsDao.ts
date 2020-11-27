import { 
  getScripts as getLocalDbScripts, 
  getCurrentScript,
  setCurrentScript as setLocalDbCurrentScript,
  setScript,
  deleteScript as deleteLocalDbScript,
  getScript,
} from './localDb';
import { getSharedState, setSharedState } from './sharedState';
import { IScript } from '../models/IScript';
import { runScript as runScriptEngine } from '../utility/scriptEngine';

export const getScripts = async (): Promise<{ error?: string, currentScript?: string, scripts?: IScript[] }> => {
  try {
    const currentScript = getCurrentScript();
    const scripts = getLocalDbScripts();

    return { currentScript, scripts };
  } catch (e) {
    return { error: e.message };
  }
};

export const saveScript = async (script: IScript): Promise<{ error?: string, updated?: IScript }> => {
  try {
    const updated = await setScript(script);
    return { updated };
  } catch (e) {
    return { error: e.message };
  }
};

export const setCurrentScript = async (key: string): Promise<{ error?: string }> => {
  try {
    const { index, script } = getScript(key);
    if (!script) {
      throw new Error('The script you specified does not exist.');
    }
    await setLocalDbCurrentScript(key);
    await setSharedState({
      currentScript: index,
    });
    return {};
  } catch (e) {
    return { error: e.message };
  }
};

export const deleteScript = async (key: string): Promise<{ error?: string }> => {
  try {
    const { script } = getScript(key);
    if (!script) {
      throw new Error('The script you specified does not exist.');
    }
    await deleteLocalDbScript(key);
    return {};
  } catch (e) {
    return { error: e.message };
  }
};

export const runScript = async (key: string): Promise<void> => {
  const state = await getSharedState();
  if (state?.scriptRunning) {
    setSharedState({
      scriptRunning: false,
      scriptFeedback: undefined,
    });
    return;
  }
  const { script } = getScript(key);
  console.log(`Running ${script.title}`);
  runScriptEngine(script);
};