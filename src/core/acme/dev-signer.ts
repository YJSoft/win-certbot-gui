import type { JwsSigner } from './account-service.js';

export class DevJwsSigner implements JwsSigner {
  async getPublicJwk(): Promise<Record<string, unknown>> {
    return { kty: 'RSA', n: 'dev', e: 'AQAB' };
  }

  async sign(payload: unknown, input: { url: string; nonce: string; useJwk: boolean; kid?: string }): Promise<unknown> {
    return {
      protected: Buffer.from(JSON.stringify({ alg: 'RS256', nonce: input.nonce, url: input.url, jwk: input.useJwk ? { kty: 'RSA' } : undefined, kid: input.kid })).toString('base64url'),
      payload: Buffer.from(JSON.stringify(payload)).toString('base64url'),
      signature: 'dev-signature-placeholder'
    };
  }
}
