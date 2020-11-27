import { runScript } from '../utility/scriptEngine';
import { setEncoderValue } from '../hardware/rotaryEncoder';
import { Icons } from '../models/icons';
import { IModeInstance } from '../models/IModeInstance';
import { getScripts } from '../dao/localDb';
import { registerStateChange, setSharedState } from '../dao/sharedState';
import { IMenu } from '../models/IMenu';
import { BaseMode } from './baseMode';
import { setPromptInput } from './promptinput';
import { IScript } from '../models/IScript';

let scripts: IScript[];

let state = registerStateChange('mode-scripts', async (oldState, newState): Promise<void> => {
  state = newState;
  if ((oldState?.mode !== newState.mode) && (newState.mode === 'scripts')) {
    scripts = getScripts();
    setEncoderValue(0);
  }

  if ((oldState?.scriptRunning !== newState.scriptRunning) && !newState.scriptRunning) {
    await refreshScriptsMenu(newState.currentScript || 0);      
  }
});

export const ScriptsMode: IModeInstance = {
  ...BaseMode,
  key: 'scripts',
} as IModeInstance;

export const initScriptsMenu = (): IMenu => {
  scripts = getScripts();
  return {
    current: state.currentScript || 0,
    min: 0, max: scripts.length - 1,
    icon: Icons.code_16x16,
    menuItems: scripts.map(s => s.title),
    onClick: async (index: number): Promise<void> => {
      const script = {...scripts[index || 0]};
      if (!script) {
        return;
      }
      await setPromptInput(
        `Run ${script?.title}?`,
        async (): Promise<void> => {
          runScript(script);
        },
      );        
    }, 
  };
};

const refreshScriptsMenu = async (current: number): Promise<void> => {
  scripts = getScripts();
  await setSharedState({
    menu: state.menus?.[2]?.[0]
      ? [{
        ...state.menus[2][0],
        menuItems: scripts.map((s, index) => `${index === state.currentScript ? '*' : ''} ${s.title}`),
        current,
        min: 0,
        max: scripts.length - 1,
      }] 
      : [],
    textinput: undefined,
    numberinput: undefined,
  });
};