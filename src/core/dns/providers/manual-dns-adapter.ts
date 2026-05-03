import type { DnsProviderAdapter } from '../provider-adapter.js';

export class ManualDnsAdapter implements DnsProviderAdapter {
  providerId = 'manual';

  async createTxtRecord(): Promise<{ recordRef: string }> {
    return { recordRef: 'manual-entry' };
  }

  async waitForPropagation(): Promise<{ propagated: boolean; observedBy: string[] }> {
    return { propagated: false, observedBy: [] };
  }

  async deleteTxtRecord(): Promise<void> {
    return;
  }
}
