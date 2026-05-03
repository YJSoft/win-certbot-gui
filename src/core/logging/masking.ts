const KEY_VALUE_SECRETS = [
  /(api[_-]?key\s*[:=]\s*)([^\s,;]+)/gi,
  /(token\s*[:=]\s*)([^\s,;]+)/gi,
  /(password\s*[:=]\s*)([^\s,;]+)/gi,
  /(secret\s*[:=]\s*)([^\s,;]+)/gi,
  /(authorization\s*[:=]\s*)(bearer\s+[A-Za-z0-9._-]+)/gi
];

const PEM_PRIVATE_KEY = /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g;
const QUERY_SECRET = /(api_key|token|access_key)=([^&\s]+)/gi;

function partialMask(value: string): string {
  if (value.length <= 6) return '[REDACTED]';
  return `${value.slice(0, 4)}${'*'.repeat(Math.max(4, value.length - 6))}${value.slice(-2)}`;
}

export function maskSecrets(input: string): string {
  let masked = input.replace(PEM_PRIVATE_KEY, '[REDACTED_PRIVATE_KEY]');
  masked = masked.replace(QUERY_SECRET, (_m, key) => `${key}=[REDACTED]`);

  for (const pattern of KEY_VALUE_SECRETS) {
    masked = masked.replace(pattern, (_m, p1, p2) => `${p1}${partialMask(String(p2))}`);
  }

  return masked;
}

export interface LogContext {
  requestId?: string;
  jobId?: string;
  code?: string;
}

export function toStructuredLog(message: string, context: LogContext = {}): string {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    message: maskSecrets(message),
    ...context
  });
}
