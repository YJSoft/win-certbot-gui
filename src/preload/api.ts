import type { ApiResponse, AppSettings, CertificateSummary } from '../core/ipc/contracts.js';

export interface RendererApi {
  getSettings(): Promise<ApiResponse<AppSettings>>;
  updateSettings(patch: Partial<AppSettings>): Promise<ApiResponse<AppSettings>>;
  getCertificateList(): Promise<ApiResponse<CertificateSummary[]>>;
  createAcmeAccount(input: { directoryUrl: string; email: string; acceptTos: boolean }): Promise<{ kid: string }>;
  runHttpPrecheck(input: { domain: string; token: string; keyAuthorization: string }): Promise<{ ok: boolean; reason?: string }>;
  runDnsCheck(input: { domain: string; txtValue: string }): Promise<{ propagated: boolean }>;
}

export function createRendererApi(invoke: (channel: string, payload?: unknown) => Promise<ApiResponse<unknown>>): RendererApi {
  return {
    getSettings: () => invoke('settings.get') as Promise<ApiResponse<AppSettings>>,
    updateSettings: (patch) => invoke('settings.update', patch) as Promise<ApiResponse<AppSettings>>,
    getCertificateList: () => invoke('cert.list.get') as Promise<ApiResponse<CertificateSummary[]>>,
    createAcmeAccount: () => { throw new Error('not initialized'); },
    runHttpPrecheck: () => { throw new Error('not initialized'); },
    runDnsCheck: () => { throw new Error('not initialized'); }
  };
}
