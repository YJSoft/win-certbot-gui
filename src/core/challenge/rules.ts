export type ChallengeType = 'http-01' | 'dns-01';

export function isWildcardDomain(domain: string): boolean {
  return domain.startsWith('*.');
}

export function allowedChallengesForDomain(domain: string): ChallengeType[] {
  if (isWildcardDomain(domain)) {
    return ['dns-01'];
  }

  return ['http-01', 'dns-01'];
}
