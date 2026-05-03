export interface DnsProviderError {
  code: 'DNS_AUTH_FAILED' | 'DNS_ZONE_NOT_FOUND' | 'DNS_RECORD_CONFLICT' | 'DNS_PROPAGATION_TIMEOUT' | 'DNS_RATE_LIMITED';
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export interface DnsProviderAdapter {
  providerId: string;
  createTxtRecord(input: { fqdn: string; value: string; ttl?: number; context?: Record<string, unknown> }): Promise<{ recordRef: string }>;
  waitForPropagation(input: {
    fqdn: string;
    expectedValue: string;
    timeoutSec: number;
    intervalSec: number;
    resolvers?: string[];
  }): Promise<{ propagated: boolean; observedBy: string[] }>;
  deleteTxtRecord(input: { recordRef?: string; fqdn: string; value: string }): Promise<void>;
}
