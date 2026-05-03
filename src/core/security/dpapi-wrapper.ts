/**
 * Windows DPAPI placeholder wrapper.
 * Sprint 1에서는 인터페이스/호출부를 먼저 고정하고 구현체는 교체 가능하게 둔다.
 */
export interface SecretCrypto {
  encrypt(plainText: string): Promise<string>;
  decrypt(cipherText: string): Promise<string>;
}

export class NoopDpapiCrypto implements SecretCrypto {
  async encrypt(plainText: string): Promise<string> {
    return Buffer.from(plainText, 'utf-8').toString('base64');
  }

  async decrypt(cipherText: string): Promise<string> {
    return Buffer.from(cipherText, 'base64').toString('utf-8');
  }
}
