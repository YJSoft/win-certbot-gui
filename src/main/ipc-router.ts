import type { ApiResponse, AppSettings, CertificateSummary, IpcChannel } from '../core/ipc/contracts.js';
import { IPC_WHITELIST } from '../core/ipc/contracts.js';
import { SettingsService } from '../core/settings/settings-service.js';

export class IpcRouter {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly certListProvider: () => Promise<CertificateSummary[]>
  ) {}

  async handle(channel: string, payload?: unknown): Promise<ApiResponse<unknown>> {
    if (!IPC_WHITELIST.has(channel as IpcChannel)) {
      return {
        ok: false,
        error: {
          code: 'UNAUTHORIZED_CHANNEL',
          message: `Blocked channel: ${channel}`
        }
      };
    }

    if (channel === 'settings.get') {
      const data = await this.settingsService.getSettings();
      return { ok: true, data };
    }

    if (channel === 'settings.update') {
      const data = await this.settingsService.updateSettings((payload ?? {}) as Partial<AppSettings>);
      return { ok: true, data };
    }

    const certs = await this.certListProvider();
    return { ok: true, data: certs };
  }
}
