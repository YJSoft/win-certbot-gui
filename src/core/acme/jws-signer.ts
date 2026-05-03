import { exportJWK, importJWK, JWK, KeyLike, FlattenedSign } from 'jose';
import { createPrivateKey } from 'node:crypto';

export interface AcmeJwsInput {
  url: string;
  nonce: string;
  payload: unknown;
  kid?: string;
  useJwk: boolean;
}

export class AcmeJwsSigner {
  private key!: KeyLike;
  private publicJwk!: JWK;

  async initFromPem(privateKeyPem: string): Promise<void> {
    this.key = createPrivateKey(privateKeyPem) as unknown as KeyLike;
    this.publicJwk = await exportJWK(this.key);
  }

  async initFromJwk(privateJwk: JWK): Promise<void> {
    const imported = await importJWK(privateJwk, 'RS256');
    if (!(imported instanceof Uint8Array)) this.key = imported;
    else throw new Error('Unsupported JWK key type for RS256 signer');
    this.publicJwk = await exportJWK(this.key);
  }


  async getPublicJwk(): Promise<Record<string, unknown>> {
    if (!this.publicJwk) throw new Error('AcmeJwsSigner is not initialized.');
    return this.publicJwk as unknown as Record<string, unknown>;
  }

  async sign(input: AcmeJwsInput): Promise<{ protected: string; payload: string; signature: string }> {
    if (!this.key || !this.publicJwk) throw new Error('AcmeJwsSigner is not initialized.');

    const protectedHeader: Record<string, unknown> = { alg: 'RS256', nonce: input.nonce, url: input.url };
    if (input.useJwk) protectedHeader.jwk = this.publicJwk;
    if (!input.useJwk && input.kid) protectedHeader.kid = input.kid;

    const payloadString = input.payload === '' ? '' : JSON.stringify(input.payload);
    const signer = new FlattenedSign(Buffer.from(payloadString));
    const jws = await signer.setProtectedHeader(protectedHeader).sign(this.key);
    return { protected: jws.protected ?? '', payload: jws.payload, signature: jws.signature };
  }
}
