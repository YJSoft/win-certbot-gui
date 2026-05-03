import { contextBridge } from 'electron';
import { createRendererApi } from './api.js';
import { createDevRuntime } from '../main/dev-runtime.js';

void createDevRuntime().then((runtime) => {
  const api = createRendererApi((channel, payload) => runtime.router.handle(channel, payload));

  api.createAcmeAccount = async (input) => runtime.accountService.ensureAccount(input);
  api.runHttpPrecheck = async (input) => {
    const file = runtime.httpService.buildChallengeFile(input);
    return runtime.httpService.precheck(file);
  };
  api.runDnsCheck = async (input) => runtime.dnsService.wait(input);

  contextBridge.exposeInMainWorld('winCertbotApi', api);
});
