import type { RendererApi } from '../preload/api.js';

declare global {
  interface Window {
    winCertbotApi: RendererApi;
  }
}

export {};
