export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED_CHANNEL'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'HTTP_CHALLENGE_FILE_UNREACHABLE';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: ApiError;
}

export interface AppSettings {
  acmeDirectoryUrl: string;
  defaultChallengeType: 'http-01' | 'dns-01';
  staging: boolean;
}

export interface CertificateSummary {
  id: string;
  commonName: string;
  status: 'issued' | 'pending' | 'failed';
  notAfter?: string;
}

export type IpcChannel = 'settings.get' | 'settings.update' | 'cert.list.get';

export const IPC_WHITELIST: ReadonlySet<IpcChannel> = new Set([
  'settings.get',
  'settings.update',
  'cert.list.get'
]);
