import { SettingsService } from '../core/settings/settings-service.js';
import { IpcRouter } from './ipc-router.js';
import { HttpChallengeService } from '../core/http/http-challenge-service.js';
import { DnsChallengeService } from '../core/dns/dns-challenge-service.js';
import { ManualDnsAdapter } from '../core/dns/providers/manual-dns-adapter.js';
import { SecretVault } from '../core/security/secret-vault.js';
import { NoopDpapiCrypto } from '../core/security/dpapi-wrapper.js';
import { AcmeAccountService, type AccountStateStore, type AcmeHttpClient } from '../core/acme/account-service.js';
import { AcmeJwsSigner } from '../core/acme/jws-signer.js';
import { generateKeyPairSync } from 'node:crypto';

class MemoryAccountStateStore implements AccountStateStore {
  private kid: string | null = null;
  async getAccountKid(): Promise<string | null> { return this.kid; }
  async setAccountKid(kid: string): Promise<void> { this.kid = kid; }
}
class DevAcmeHttpClient implements AcmeHttpClient {
  async getDirectory() { return { newNonce: 'https://acme-staging-v02.api.letsencrypt.org/acme/new-nonce', newAccount: 'https://acme-staging-v02.api.letsencrypt.org/acme/new-acct', newOrder: 'https://acme-staging-v02.api.letsencrypt.org/acme/new-order', meta: { externalAccountRequired: false } }; }
  async getNonce(): Promise<string> { return 'dev-nonce'; }
  async postJws(): Promise<{ status: number; headers: Headers; body: unknown }> { const headers = new Headers(); headers.set('location', 'https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456'); return { status: 201, headers, body: { status: 'valid' } }; }
}

export async function createDevRuntime() {
  const settingsService = new SettingsService('data/config.json');
  const router = new IpcRouter(settingsService, async () => [{ id: 'cert-1', commonName: 'example.com', status: 'issued', notAfter: '2026-08-10' }]);
  const secretVault = new SecretVault('data/secrets.json', new NoopDpapiCrypto());

  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = privateKey.export({ format: 'pem', type: 'pkcs8' }).toString();
  const signer = new AcmeJwsSigner();
  await signer.initFromPem(pem);

  const accountService = new AcmeAccountService(new DevAcmeHttpClient(), signer, new MemoryAccountStateStore(), secretVault);
  return { router, httpService: new HttpChallengeService(), dnsService: new DnsChallengeService(new ManualDnsAdapter()), accountService };
}
