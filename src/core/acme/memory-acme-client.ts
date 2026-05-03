import type { AcmeDirectory, AcmeHttpClient } from './account-service.js';

export class FetchAcmeHttpClient implements AcmeHttpClient {
  async getDirectory(url: string): Promise<AcmeDirectory> {
    const res = await fetch(url);
    return (await res.json()) as AcmeDirectory;
  }

  async getNonce(newNonceUrl: string): Promise<string> {
    const res = await fetch(newNonceUrl, { method: 'HEAD' });
    const nonce = res.headers.get('replay-nonce');
    if (!nonce) throw new Error('Replay-Nonce missing from ACME server response');
    return nonce;
  }

  async postJws(url: string, jwsBody: unknown): Promise<{ status: number; headers: Headers; body: unknown }> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/jose+json' },
      body: JSON.stringify(jwsBody)
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, headers: res.headers, body };
  }
}
