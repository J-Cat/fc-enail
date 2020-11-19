import { IMenu, registerStateChange, setSharedState } from '../../utility/sharedState';

let state = registerStateChange('mode-settings-networkinfo', (oldState, newState) => {
  state = newState;
});

export const initNetworkInfo = async (): Promise<void> => {
  const menus = [...(state.menu || [])];
  const menu = menus.pop() as IMenu;
  setSharedState({ menu: [
    ...menus, {
      ...menu,
      action: menu.action === 'network' ? undefined : 'network',
    }
  ]});
};