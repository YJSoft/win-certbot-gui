export const HTTP_MANUAL_GUIDE = {
  purpose: 'HTTP-01은 http://<도메인>/.well-known/acme-challenge/<token> 외부 접근이 필요합니다.',
  checklist: [
    '파일을 정확한 경로에 업로드했습니다.',
    '파일 내용이 keyAuthorization과 정확히 일치합니다.',
    '브라우저에서 검증 URL 접근 시 200 응답을 확인했습니다.'
  ],
  diagnostics: [
    '404 Not Found: 파일 경로 또는 배포 상태를 확인하세요.',
    '403 Forbidden: 웹서버 권한/보안 정책을 확인하세요.',
    'Timeout: 방화벽/네트워크/DNS를 확인하세요.',
    'Unexpected Body: 업로드된 파일 내용을 다시 확인하세요.'
  ]
} as const;
