# 위협 모델 (Threat Model)

## 1) 보호 자산
- ACME 계정 개인키
- 도메인 인증서 개인키
- DNS 공급자 API 자격증명
- 인증서 메타데이터(도메인, 만료일, 저장 경로)

## 2) 신뢰 경계
- Renderer Process (비신뢰 입력 경계)
- Preload IPC Bridge (허용 API 경계)
- Main/Core Process (민감 처리 신뢰 영역)
- 외부 시스템(ACME, DNS API, 파일시스템)

## 3) STRIDE 기반 위협 식별

### S: Spoofing
- 위협: 악성 렌더러 코드가 민감 IPC 호출 위조
- 대응: 채널 화이트리스트, 요청 스키마 검증, 세션/출처 검증

### T: Tampering
- 위협: 인증서/키 파일 또는 설정 파일 위변조
- 대응: 저장 시 무결성 체크섬, 권한 최소화, 원자적 쓰기

### R: Repudiation
- 위협: 누가 어떤 발급/갱신 작업을 했는지 추적 불가
- 대응: requestId/jobId 기반 감사 로그, 중요 이벤트 타임스탬프 기록

### I: Information Disclosure
- 위협: 로그/크래시 덤프/IPC 응답에 비밀정보 노출
- 대응: 토큰/키 마스킹, secret redaction, 민감 필드 반환 금지

### D: Denial of Service
- 위협: 과도한 재시도로 ACME/DNS rate limit 유발
- 대응: 백오프/회로차단, 동시 job 제한, 스테이징 기본 설정

### E: Elevation of Privilege
- 위협: Renderer가 파일시스템/키 복호화 권한을 우회 획득
- 대응: Preload 최소 API, Main 전용 보안 연산, 경로 allowlist

## 4) 우선순위 리스크
1. DNS API 자격증명 유출
2. 개인키 평문 저장 또는 노출
3. 잘못된 IPC 권한 설계로 인한 권한 상승
4. 로그를 통한 민감정보 2차 유출

## 5) 완화 계획
- 릴리즈 전 위협 모델 리뷰(보안 체크리스트 포함)
- IPC 퍼징/스키마 검증 테스트
- 로그 샘플링 검사로 마스킹 누락 탐지
- 비밀정보 저장소 접근 감사 이벤트 주기 점검
