# 7단계: 구현 로드맵 (Sprint Plan)

## Sprint 1: 프로젝트 기초
- Electron + React + TypeScript 초기 세팅
- IPC 기본 골격
- 설정/로그/스토리지 기본 구조

## Sprint 2: ACME 코어 구현
- 계정 등록/로드
- Order/Authorization/Finalize 기본 시나리오
- 스테이징 환경 기준 발급 테스트

## Sprint 3: HTTP-01
- 파일 생성/검증 루틴
- 수동 업로드 UX
- 실패 진단 로직

## Sprint 4: DNS-01
- Provider 인터페이스
- 최소 1개 DNS 공급자 자동화 연동
- 전파 체크 로직
- wildcard 필수 DNS 규칙 강제

## Sprint 5: 보안 강화
- 키/토큰 암호화 저장
- 로그 마스킹
- 오류 복구 전략 고도화

## Sprint 6: 사용자 경험 개선
- 발급 마법사 polishing
- 갱신 스케줄러
- 알림/만료 경고

## Sprint 7: 배포 준비
- 설치 패키지(MSI/NSIS)
- 코드서명
- 업데이트 전략(자동 업데이트 여부 결정)

## 산출물
- 스프린트별 완료 기준(DoD)
- 이슈 템플릿/릴리즈 체크리스트
