# 3단계: HTTP-01 인증 방식 구현 계획

## 지원 대상
- 비-와일드카드 도메인만 허용

## 사용자 입력 항목
- 웹루트 경로(예: `C:\inetpub\wwwroot`)
- 또는 업로드 방식(FTP/SFTP/수동 업로드 안내 중 택1)
- 검증 대상 URL 미리보기(`http://<domain>/.well-known/acme-challenge/<token>`)

## 구현 흐름
1. 토큰/키권한값 생성
2. `.well-known/acme-challenge/` 경로에 파일 생성
3. 로컬/원격 업로드
4. 사전 확인(애플리케이션에서 HTTP GET 체크)
5. ACME 서버에 challenge ready 요청
6. 성공 후 파일 정리(옵션)

## UI/UX 요구사항
- "파일 생성됨 / 업로드 완료 / 외부 접속 확인됨" 3단계 체크리스트
- 실패 시 진단 버튼 제공
  - URL 직접 열기
  - 응답 코드 표시
  - 리다이렉트/캐시 경고

## 산출물
- HTTP 핸들러 모듈
- 수동/자동 업로드 가이드 문구
