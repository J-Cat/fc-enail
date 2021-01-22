import { setEncoderValue } from '../hardware/rotaryEncoder';
import { getCurrentProfile, getCurrentScript, getProfiles, getScripts } from '../dao/localDb';
import { registerStateChange, setNextMode, setPreviousMode, setSharedState } from '../dao/sharedState';
import { IMenu } from '../models/IMenu';

let state = registerStateChange('menu', async (oldState, newState): Promise<void> => {
  state = newState;
  if (oldState?.mode !== newState.mode) {
    switch (newState.mode) {
    case 'settings': {
      setSharedState({
        menu: newState.menus?.[0],
      });  
      break;
    }
    case 'profiles': {
      const profiles = getProfiles();
      const currentKey = getCurrentProfile();
      const currentProfile = profiles.findIndex(p => p.key === currentKey);
      setSharedState({
        menu: newState.menus?.[1]?.[0]
          ? [{
            ...newState.menus[1][0],
            menuItems: profiles.map(p => `${p.key === currentKey ? '*' : ''} ${p.title}`),
            current: currentProfile,
            min: 0,
            max: profiles.length - 1,
          }] 
          : [],
        currentProfile,
      });
      break;
    }
    case 'scripts': {
      const scripts = getScripts();
      const currentKey = getCurrentScript();
      const currentScript = scripts.findIndex(s => s.key === currentKey);
      setSharedState({
        menu: newState.menus?.[2]?.[0]
          ? [{
            ...newState.menus[2][0],
            menuItems: scripts.map(s => `${s.key === currentKey ? '*' : ''} ${s.title}`),
            current: currentScript,
            min: 0,
            max: scripts.length - 1,
          }] 
          : [],
        currentScript,
      });
      break;
    }
    }
  }
});

export const useMenuLongClick = async (): Promise<void> => {
  const menu = state.menu?.[state.menu?.length - 1];
  menu?.onLongClick?.(menu.current);
};

export const useMenuClick = async (): Promise<void> => {
  const menu = state.menu?.[state.menu?.length - 1];
  await menu?.onClick(menu.current, menu.action);
};

export const useMenuEncoderClick = async (): Promise<boolean> => {
  const menus = [...(state.menu || [])];

  if (menus.length <= 1) {
    if (menus?.[0].action) {
      setSharedState({ menu: [{...menus[0], action: undefined }]});
      return true;
    }

    setNextMode('self');
    return true;
  }

  const menu = menus.pop() as IMenu;
  if (menu.isMoving) {
    await menu.onMove?.();
    return true;
  }

  if (menu?.action) {
    setSharedState({ menu: [...menus, { ...menu, action: undefined }]});
    return true;
  }
  if (menu) {
    setSharedState({ menu: [...menus]});
    return true;
  }

  return false;
};

export const useMenuEncoderLongClick = async (): Promise<boolean> => {
  const menus = [...(state.menu || [])];

  if (menus.length <= 1) {
    if (menus?.[0].action) {
      setSharedState({ menu: [{...menus[0], action: undefined }]});
      return true;
    }

    setPreviousMode('self');
    return true;
  }

  const menu = menus.pop() as IMenu;
  if (menu.isMoving) {
    await menu.onMove?.();
    return true;
  }

  if (menu?.action) {
    setSharedState({ menu: [...menus, { ...menu, action: undefined }]});
    return true;
  }
  if (menu) {
    setSharedState({ menu: [...menus]});
    return true;
  }

  return false;
};

export const useMenuEncoderChange = async (increment: number): Promise<void> => {
  const menus = [...(state.menu || [])];
  const menu = menus.pop();
  if (!menu) {
    return;
  }

  if (menu?.isMoving) {
    let newPos = menu.current + increment;
    if (newPos < 0) {
      newPos = 0;
    }
    if (newPos > menu.max) {
      newPos = menu.max;
    }
    const items = [...menu.menuItems];
    const item = items[menu.current];
    let newItems = items.filter((value, index) => index !== menu.current);
    newItems = [
      ...(newPos > 0 ? newItems.slice(0, newPos) : []),
      item,
      ...(newPos < newItems.length ? newItems.slice(newPos) : [])
    ];
    setSharedState({ menu: [
      ...menus, {
        ...menu,
        current: newPos,
        menuItems: [...newItems],
      }
    ]});
    setEncoderValue(0, false);        
    return;
  }

  let newPos = (menu.current || 0) + increment;
  if (newPos >= (menu.max || 0)) {
    newPos = menu.max || 0;
  } else if (newPos < (menu.min || 0)) {
    newPos = menu.min || 0;
  }
  setSharedState({ menu: [
    ...menus, {
      ...menu,
      current: newPos,
    }
  ]});
  setEncoderValue(0, false);  
};

export const getMenuUpdate = (updates: Partial<IMenu>): IMenu[] => {
  const menus = [...(state.menu || [])];
  const menu = menus.pop() as IMenu;

  return [
    ...menus, {
      ...menu,
      ...updates,
    },
  ];
};
