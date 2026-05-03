import type { HttpChallengeFile, HttpChallengeMaterial, HttpPrecheckResult, HttpUploadMode } from './types.js';
import type { HttpUploader } from './uploaders.js';

export class HttpChallengeService {
  buildChallengeFile(material: HttpChallengeMaterial): HttpChallengeFile {
    return {
      relativePath: `.well-known/acme-challenge/${material.token}`,
      content: material.keyAuthorization,
      verificationUrl: `http://${material.domain}/.well-known/acme-challenge/${material.token}`
    };
  }

  async uploadChallengeFile(mode: HttpUploadMode, file: HttpChallengeFile, uploader?: HttpUploader): Promise<void> {
    if (mode === 'manual') {
      return;
    }

    if (!uploader || uploader.mode !== mode) {
      throw new Error(`Uploader not configured for mode: ${mode}`);
    }

    await uploader.upload(file);
  }

  async precheck(file: HttpChallengeFile): Promise<HttpPrecheckResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(file.verificationUrl, { signal: controller.signal, redirect: 'manual' });
      const body = await response.text();
      const bodyMatched = body.trim() === file.content.trim();

      if (response.status === 404) return { ok: false, statusCode: 404, reason: 'HTTP_404' };
      if (response.status === 403) return { ok: false, statusCode: 403, reason: 'HTTP_403' };
      if (!bodyMatched) return { ok: false, statusCode: response.status, reason: 'HTTP_UNEXPECTED_BODY', bodyMatched };

      return { ok: response.ok, statusCode: response.status, bodyMatched };
    } catch {
      return { ok: false, reason: 'HTTP_TIMEOUT' };
    } finally {
      clearTimeout(timeout);
    }
  }
}
