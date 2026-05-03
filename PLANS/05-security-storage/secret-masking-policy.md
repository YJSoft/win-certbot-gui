# 비밀정보 마스킹 정책

## 1) 목적
로그/오류/진단 출력에서 비밀정보가 노출되지 않도록 일관된 마스킹 규칙을 정의한다.

## 2) 마스킹 대상
- DNS API 토큰, Access Key/Secret
- 개인키 PEM 본문
- ACME account key/JWK 민감 필드
- Authorization header, Bearer token
- 사용자 입력 중 비밀번호/패스프레이즈

## 3) 기본 원칙
- "기록하지 않는 것"을 최우선으로 한다.
- 필요한 경우에도 원문 대신 참조 ID만 기록한다.
- 예외 로그에서도 동일 규칙 적용(에러 스택 포함)

## 4) 마스킹 규칙
- 토큰류: 앞 4자리/뒤 2자리만 남기고 `*` 처리
  - 예: `abcd**********yz`
- 키/PEM: 전체 치환
  - 예: `[REDACTED_PRIVATE_KEY]`
- 헤더: 민감 헤더 값 전체 치환
  - 예: `Authorization: [REDACTED]`
- URL Query 내 secret 파라미터 치환
  - 예: `api_key=[REDACTED]`

## 5) 적용 지점
- IPC 요청/응답 로깅
- HTTP 클라이언트 디버그 로그(ACME/DNS API)
- 예외 처리/크래시 리포트
- 진단 번들(export) 생성 시

## 6) 검증 및 운영
- 단위 테스트: 샘플 secret 입력 시 마스킹 결과 검증
- 금칙어 스캔: 로그 파일에 PEM 헤더/토큰 패턴 탐지
- 릴리즈 체크리스트에 "마스킹 검증" 필수 항목 추가
- 마스킹 실패 이벤트는 보안 이슈로 분류해 우선 대응
