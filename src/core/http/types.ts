export type HttpUploadMode = 'webroot' | 'ftp' | 'sftp' | 'manual';

export interface HttpChallengeMaterial {
  domain: string;
  token: string;
  keyAuthorization: string;
}

export interface HttpChallengeFile {
  relativePath: string;
  content: string;
  verificationUrl: string;
}

export interface HttpPrecheckResult {
  ok: boolean;
  statusCode?: number;
  bodyMatched?: boolean;
  reason?: 'HTTP_404' | 'HTTP_403' | 'HTTP_TIMEOUT' | 'HTTP_UNEXPECTED_BODY';
}
