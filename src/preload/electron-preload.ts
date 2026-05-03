import { contextBridge } from 'electron';
import { createRendererApi } from './api.js';
import { createDevRuntime } from '../main/dev-runtime.js';

void createDevRuntime().then((runtime) => {
  const api = createRendererApi((channel, payload) => runtime.router.handle(channel, payload));
  contextBridge.exposeInMainWorld('winCertbotApi', api);
});
