# 4단계: DNS-01 인증 방식 구현 계획

## 지원 대상
- 일반 도메인/와일드카드 모두 지원
- **와일드카드는 DNS-01 필수**

## 사용자 입력 항목
- DNS 공급자 선택(Cloudflare, Route53, Azure DNS 등)
- 인증 정보(API 토큰/키)
- 전파 대기 시간(기본값 + 고급 설정)

## 구현 흐름
1. `_acme-challenge.<domain>` TXT 값 생성
2. DNS API로 TXT 레코드 생성/업데이트
3. DNS 조회로 전파 확인(다중 resolver 체크)
4. ACME challenge ready 요청
5. 성공 후 TXT 레코드 정리(옵션)

## 공급자 확장 전략
- Provider 인터페이스 정의
  - `createTxtRecord()`
  - `waitForPropagation()`
  - `deleteTxtRecord()`
- 공급자별 구현체를 플러그인처럼 추가 가능하게 구조화

## UI/UX 요구사항
- "TXT 등록됨 / 전파 확인됨 / 검증 요청됨" 상태바
- 전파 지연 시 예상 대기시간 안내
- 수동 모드(사용자가 DNS 직접 입력) 지원

## 산출물
- DNS provider SDK 어댑터 계층
- DNS 수동/자동 모드 화면
