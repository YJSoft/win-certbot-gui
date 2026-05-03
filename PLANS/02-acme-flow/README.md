# 2단계: ACME 발급 플로우 상세화

## 표준 발급 플로우
1. ACME 계정 키 생성/로드
2. Let's Encrypt ACME 디렉터리 조회
3. 신규 Order 생성(도메인/SAN 포함)
4. Authorization 목록 수신
5. 각 도메인별 Challenge 선택/수행
6. Challenge 검증 요청
7. 검증 완료 후 CSR 생성
8. Finalize 호출
9. 인증서 체인 다운로드
10. 로컬 저장 + UI 표시

## 도메인/챌린지 선택 규칙
- 일반 도메인(`example.com`, `www.example.com`): HTTP-01 또는 DNS-01 선택 가능
- 와일드카드(`*.example.com`): **DNS-01만 허용 (UI에서 HTTP 옵션 비활성화)**
- 혼합 SAN(예: `example.com` + `*.example.com`): 전체 오더를 DNS-01 중심으로 처리 권장

## 에러 처리 정책
- ACME rate limit 감지 시 재시도 간격 안내
- Challenge 실패 시 원인 분류
  - DNS 전파 지연
  - HTTP 파일 접근 실패(404/timeout)
  - 토큰 불일치
- 실패 단계 재개 기능(재검증부터 재시도)

## 산출물
- 시퀀스 다이어그램(ACME API 호출 순서)
- 상태 전이도(READY → PENDING → VALID/INVALID)
