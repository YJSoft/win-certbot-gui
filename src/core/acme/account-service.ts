import { createHmac } from 'node:crypto';
import { SecretVault } from '../security/secret-vault.js';

export interface AcmeDirectory {
  newNonce: string;
  newAccount: string;
  newOrder: string;
  meta?: { termsOfService?: string; externalAccountRequired?: boolean };
}

export interface JwsSigner {
  sign(payload: unknown, input: { url: string; nonce: string; useJwk: boolean; kid?: string }): Promise<unknown>;
  getPublicJwk(): Promise<Record<string, unknown>>;
}

export interface AcmeHttpClient {
  getDirectory(url: string): Promise<AcmeDirectory>;
  getNonce(newNonceUrl: string): Promise<string>;
  postJws(url: string, jwsBody: unknown): Promise<{ status: number; headers: Headers; body: unknown }>;
}

export interface AccountStateStore {
  getAccountKid(): Promise<string | null>;
  setAccountKid(kid: string): Promise<void>;
}

export interface EabInput {
  kid: string;
  hmacKey: string;
}

function createEabBinding(newAccountUrl: string, accountPublicJwk: Record<string, unknown>, eab: EabInput): { protected: string; payload: string; signature: string } {
  const protectedHeader = Buffer.from(
    JSON.stringify({ alg: 'HS256', kid: eab.kid, url: newAccountUrl })
  ).toString('base64url');
  const payload = Buffer.from(JSON.stringify(accountPublicJwk)).toString('base64url');
  const mac = createHmac('sha256', Buffer.from(eab.hmacKey, 'base64'));
  mac.update(`${protectedHeader}.${payload}`);
  const signature = mac.digest('base64url');
  return { protected: protectedHeader, payload, signature };
}

export class AcmeAccountService {
  constructor(
    private readonly http: AcmeHttpClient,
    private readonly signer: JwsSigner,
    private readonly stateStore: AccountStateStore,
    private readonly secretVault: SecretVault
  ) {}

  private async postWithBadNonceRetry(newNonceUrl: string, url: string, payload: unknown, useJwk: boolean, kid?: string) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const nonce = await this.http.getNonce(newNonceUrl);
      const jws = await this.signer.sign(payload, { url, nonce, useJwk, kid });
      const response = await this.http.postJws(url, jws);
      const type = (response.body as { type?: string })?.type;
      if (response.status !== 400 || type !== 'urn:ietf:params:acme:error:badNonce') {
        return response;
      }
    }
    throw new Error('ACME badNonce retry exhausted');
  }

  async ensureAccount(input: { directoryUrl: string; email: string; acceptTos: boolean; eab?: EabInput }): Promise<{ kid: string }> {
    const existingKid = await this.stateStore.getAccountKid();
    if (existingKid) return { kid: existingKid };

    const directory = await this.http.getDirectory(input.directoryUrl);
    const payload: Record<string, unknown> = {
      contact: [`mailto:${input.email}`],
      termsOfServiceAgreed: input.acceptTos
    };

    if (directory.meta?.externalAccountRequired && !input.eab) {
      throw new Error('External Account Binding required by CA but missing EAB credentials.');
    }

    if (input.eab) {
      const accountPublicJwk = await this.signer.getPublicJwk();
      payload.externalAccountBinding = createEabBinding(directory.newAccount, accountPublicJwk, input.eab);
    }

    const response = await this.postWithBadNonceRetry(directory.newNonce, directory.newAccount, payload, true);
    const location = response.headers.get('location');
    if (!location) throw new Error('ACME account creation failed: missing account URL(location header).');

    await this.stateStore.setAccountKid(location);
    await this.secretVault.put(`acme-account:${location}`);
    return { kid: location };
  }
}
