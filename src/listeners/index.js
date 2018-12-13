import { setApp, removeApp } from '../state/app-management/actions';
import { changeRoute } from '../state/router/actions';
import { setPreference } from '../state/preferences/actions';

import { ROUTE_PREFERENCES } from '../constants/routes';

const { ipcRenderer } = window.require('electron');

const loadListeners = (store) => {
  ipcRenderer.on('log', (e, message) => {
    // eslint-disable-next-line
    if (message) console.log(message);
  });

  ipcRenderer.on('set-app', (e, id, app) => {
    store.dispatch(setApp(id, app));
  });

  ipcRenderer.on('remove-app', (e, id) => store.dispatch(removeApp(id)));

  ipcRenderer.on('set-preference', (e, name, value) => {
    store.dispatch(setPreference(name, value));
  });

  ipcRenderer.on('go-to-preferences', () => store.dispatch(changeRoute(ROUTE_PREFERENCES)));
};

export default loadListeners;
