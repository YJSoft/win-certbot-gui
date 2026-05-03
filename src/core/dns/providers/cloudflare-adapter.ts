import { Resolver } from 'node:dns/promises';
import type { DnsProviderAdapter } from '../provider-adapter.js';

interface CloudflareRecordResponse { result: { id: string } }

export class CloudflareAdapter implements DnsProviderAdapter {
  providerId = 'cloudflare';
  constructor(private readonly apiToken: string, private readonly zoneId: string) {}

  async createTxtRecord(input: { fqdn: string; value: string; ttl?: number }): Promise<{ recordRef: string }> {
    const name = input.fqdn.replace(/\.$/, '');
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'TXT', name, content: input.value, ttl: input.ttl ?? 60 })
    });
    if (!res.ok) throw new Error(`DNS_AUTH_FAILED: cloudflare create failed (${res.status})`);
    const body = (await res.json()) as CloudflareRecordResponse;
    return { recordRef: body.result.id };
  }

  async waitForPropagation(input: { fqdn: string; expectedValue: string; timeoutSec: number; intervalSec: number; resolvers?: string[] }): Promise<{ propagated: boolean; observedBy: string[] }> {
    const resolvers = input.resolvers?.length ? input.resolvers : ['1.1.1.1', '8.8.8.8'];
    const observedBy = new Set<string>();
    const until = Date.now() + input.timeoutSec * 1000;

    while (Date.now() < until) {
      for (const server of resolvers) {
        try {
          const resolver = new Resolver();
          resolver.setServers([server]);
          const rows = await resolver.resolveTxt(input.fqdn);
          const values = rows.map((parts) => parts.join(''));
          if (values.includes(input.expectedValue)) observedBy.add(server);
        } catch {
          // ignore per-resolver failures and continue
        }
      }

      if (observedBy.size === resolvers.length) {
        return { propagated: true, observedBy: [...observedBy] };
      }

      await new Promise((r) => setTimeout(r, input.intervalSec * 1000));
    }

    return { propagated: false, observedBy: [...observedBy] };
  }

  async deleteTxtRecord(input: { recordRef?: string }): Promise<void> {
    if (!input.recordRef) return;
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records/${input.recordRef}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.apiToken}` }
    });
    if (!res.ok) throw new Error(`DNS_RECORD_CONFLICT: cloudflare delete failed (${res.status})`);
  }
}
