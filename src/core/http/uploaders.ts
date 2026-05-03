import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { tmpdir } from 'node:os';
import * as ftp from 'basic-ftp';
import SftpClient from 'ssh2-sftp-client';
import type { HttpChallengeFile } from './types.js';

export interface HttpUploader {
  mode: 'webroot' | 'ftp' | 'sftp';
  upload(file: HttpChallengeFile): Promise<void>;
}

export class WebrootUploader implements HttpUploader {
  readonly mode = 'webroot' as const;
  constructor(private readonly webrootPath: string) {}
  async upload(file: HttpChallengeFile): Promise<void> {
    const absolute = join(this.webrootPath, file.relativePath);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, file.content, 'utf-8');
  }
}

export class FtpUploader implements HttpUploader {
  readonly mode = 'ftp' as const;
  constructor(private readonly config: { host: string; user: string; password: string; port?: number; remoteRoot: string }) {}
  async upload(file: HttpChallengeFile): Promise<void> {
    const client = new ftp.Client();
    try {
      await client.access({ host: this.config.host, user: this.config.user, password: this.config.password, port: this.config.port ?? 21, secure: false });
      const remotePath = posix.join(this.config.remoteRoot, file.relativePath.replace(/\\/g, '/'));
      await client.ensureDir(posix.dirname(remotePath));
      const tmpPath = join(await mkdtemp(join(tmpdir(), 'acme-')), 'challenge.txt');
      await writeFile(tmpPath, file.content, 'utf-8');
      await client.uploadFrom(tmpPath, remotePath);
    } finally {
      client.close();
    }
  }
}

export class SftpUploader implements HttpUploader {
  readonly mode = 'sftp' as const;
  constructor(private readonly config: { host: string; username: string; password?: string; privateKey?: string; port?: number; remoteRoot: string }) {}
  async upload(file: HttpChallengeFile): Promise<void> {
    const client = new SftpClient();
    const remotePath = posix.join(this.config.remoteRoot, file.relativePath.replace(/\\/g, '/'));
    try {
      await client.connect({ host: this.config.host, port: this.config.port ?? 22, username: this.config.username, password: this.config.password, privateKey: this.config.privateKey });
      await client.mkdir(posix.dirname(remotePath), true);
      await client.put(Buffer.from(file.content, 'utf-8'), remotePath);
    } finally {
      await client.end();
    }
  }
}
