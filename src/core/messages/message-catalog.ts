export const MESSAGE_CATALOG: Record<string, string> = {
  DRAFT: '입력 정보를 확인해주세요.',
  VALIDATING_INPUT: '도메인 형식 및 발급 조건을 확인하고 있습니다.',
  ACCOUNT_READY: 'ACME 계정 준비가 완료되었습니다.',
  ORDER_CREATED: '인증서 주문이 생성되었습니다.',
  CHALLENGE_PENDING: '도메인 검증을 진행 중입니다.',
  CHALLENGE_VALID: '도메인 검증이 완료되었습니다.',
  FINALIZING: '인증서를 발급 중입니다. 잠시만 기다려주세요.',
  ISSUED: '인증서 발급이 완료되었습니다.',
  FAILED: '발급에 실패했습니다. 원인을 확인하고 다시 시도해주세요.',
  HTTP_CHALLENGE_FILE_UNREACHABLE: '검증 파일에 접근할 수 없습니다. 경로/권한/리다이렉트를 확인하세요.',
  HTTP_404: '검증 파일을 찾을 수 없습니다(404). 업로드 경로를 다시 확인하세요.',
  HTTP_403: '접근이 거부되었습니다(403). 서버 권한 또는 보안 정책을 확인하세요.',
  HTTP_TIMEOUT: '응답 시간이 초과되었습니다. 방화벽/네트워크 상태를 확인하세요.',
  WILDCARD_REQUIRES_DNS01: '와일드카드 도메인은 DNS-01 방식만 지원합니다.',
  DNS_PROPAGATION_TIMEOUT: '전파 확인 시간이 초과되었습니다. 잠시 후 다시 확인하세요.',
  DNS_AUTH_FAILED: 'DNS 공급자 인증에 실패했습니다. API 토큰/권한을 확인하세요.'
};
