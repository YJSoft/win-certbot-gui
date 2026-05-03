import type { ApiResponse, AppSettings, CertificateSummary } from '../core/ipc/contracts.js';

export interface RendererApi {
  getSettings(): Promise<ApiResponse<AppSettings>>;
  updateSettings(patch: Partial<AppSettings>): Promise<ApiResponse<AppSettings>>;
  getCertificateList(): Promise<ApiResponse<CertificateSummary[]>>;
}

export function createRendererApi(invoke: (channel: string, payload?: unknown) => Promise<ApiResponse<unknown>>): RendererApi {
  return {
    getSettings: () => invoke('settings.get') as Promise<ApiResponse<AppSettings>>,
    updateSettings: (patch) => invoke('settings.update', patch) as Promise<ApiResponse<AppSettings>>,
    getCertificateList: () => invoke('cert.list.get') as Promise<ApiResponse<CertificateSummary[]>>
  };
}
