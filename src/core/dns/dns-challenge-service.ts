import type { DnsProviderAdapter } from './provider-adapter.js';

export interface DnsChallengeMaterial {
  domain: string;
  txtValue: string;
}

export class DnsChallengeService {
  constructor(private readonly adapter: DnsProviderAdapter) {}

  buildFqdn(domain: string): string {
    return `_acme-challenge.${domain.replace(/^\*\./, '')}`;
  }

  async present(material: DnsChallengeMaterial): Promise<{ recordRef: string; fqdn: string }> {
    const fqdn = this.buildFqdn(material.domain);
    const created = await this.adapter.createTxtRecord({ fqdn, value: material.txtValue, ttl: 60 });
    return { fqdn, recordRef: created.recordRef };
  }

  async wait(material: DnsChallengeMaterial): Promise<{ propagated: boolean; observedBy: string[] }> {
    return this.adapter.waitForPropagation({
      fqdn: this.buildFqdn(material.domain),
      expectedValue: material.txtValue,
      timeoutSec: 120,
      intervalSec: 10,
      resolvers: ['1.1.1.1', '8.8.8.8']
    });
  }

  async cleanup(material: DnsChallengeMaterial, recordRef?: string): Promise<void> {
    await this.adapter.deleteTxtRecord({
      recordRef,
      fqdn: this.buildFqdn(material.domain),
      value: material.txtValue
    });
  }
}
