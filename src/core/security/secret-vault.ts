import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { SecretCrypto } from './dpapi-wrapper.js';

interface VaultEntry {
  ref: string;
  cipherText: string;
  createdAt: string;
}

type VaultIndex = Record<string, VaultEntry>;

export class SecretVault {
  constructor(
    private readonly filePath: string,
    private readonly crypto: SecretCrypto
  ) {}

  private async readIndex(): Promise<VaultIndex> {
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      return JSON.parse(raw) as VaultIndex;
    } catch {
      return {};
    }
  }

  private async writeIndex(index: VaultIndex): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(index, null, 2), 'utf-8');
  }

  async put(secret: string): Promise<string> {
    const ref = `sec_${randomUUID()}`;
    const cipherText = await this.crypto.encrypt(secret);
    const index = await this.readIndex();
    index[ref] = { ref, cipherText, createdAt: new Date().toISOString() };
    await this.writeIndex(index);
    return ref;
  }

  async get(ref: string): Promise<string | null> {
    const index = await this.readIndex();
    const entry = index[ref];
    if (!entry) return null;
    return this.crypto.decrypt(entry.cipherText);
  }

  async remove(ref: string): Promise<void> {
    const index = await this.readIndex();
    delete index[ref];
    await this.writeIndex(index);
  }
}
