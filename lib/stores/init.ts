import { AccountStore } from './AccountStore';
import { AppStore } from './AppStore';
import { IScreenStore, initScreenStore } from './screen';
import { ThemeStore } from './ThemeStore';


let __init__ = false;

export interface IMyMobxStore {
  accountStore: AccountStore;
  appStore: AppStore;
  themeStore: ThemeStore;
  screen: IScreenStore;
}
export interface IInitialStore {
  accountStore?: Partial<AccountStore>;
  themeStore?: Partial<ThemeStore>;
  screen: Partial<IScreenStore>;
}

export const store: IMyMobxStore = {
  accountStore: new AccountStore(),
  appStore: new AppStore(),
  themeStore: new ThemeStore(),
  screen: initScreenStore(),
};

export const initStore = (initialState: IInitialStore): IMyMobxStore => {
  if (__init__) {
    return store;
  }
  __init__ = true;
  store.accountStore.update(initialState.accountStore);
  store.themeStore.update(initialState.themeStore);
  store.screen.userStore.update(initialState.screen.userStore);
  store.screen.userPictureStore.update(initialState.screen.userPictureStore);
  store.screen.userCollectionStore.update(initialState.screen.userCollectionStore);
  store.screen.homeStore.update(initialState.screen.homeStore);
  store.screen.tagStore.update(initialState.screen.tagStore);
  store.screen.pictureStore.update(initialState.screen.pictureStore);
  store.screen.collectionStore.update(initialState.screen.collectionStore);
  return store;
};
