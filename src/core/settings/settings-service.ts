import { readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { mkdir } from 'node:fs/promises';
import type { AppSettings } from '../ipc/contracts.js';

const DEFAULT_SETTINGS: AppSettings = {
  acmeDirectoryUrl: 'https://acme-staging-v02.api.letsencrypt.org/directory',
  defaultChallengeType: 'http-01',
  staging: true
};

export class SettingsService {
  constructor(private readonly filePath: string) {}

  async getSettings(): Promise<AppSettings> {
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
    const next = { ...(await this.getSettings()), ...patch };
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(next, null, 2), 'utf-8');
    return next;
  }
}
