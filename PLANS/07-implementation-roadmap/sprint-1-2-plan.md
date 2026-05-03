# Sprint 1~2 구현 로드맵 (PLANS 기반)

본 문서는 `PLANS/00`~`PLANS/06` 산출물을 기준으로 Sprint 1~2의 구현 범위와 완료 기준을 정의한다.

## Sprint 1: 프로젝트 기초

### 목표
- Electron + React + TypeScript 기반 앱 골격 구축
- Renderer/Preload/Main/Core 경계 및 IPC 기본 계약 적용
- 설정/로그/보안 저장소의 최소 실행 가능한 기반 확보

### 작업 항목
1. 앱 초기 구조 세팅
   - 프로젝트 템플릿 구성(Electron + React + TS)
   - 디렉터리 구조: `ui/`, `main/`, `core/`, `data/`
2. Preload/IPC 기본 채널
   - `settings.get`, `settings.update`, `cert.list.get` 읽기 채널 우선
   - IPC 요청/응답 공통 타입(`ApiResponse`, `ApiError`) 도입
3. 보안 저장소 기초
   - DPAPI 래퍼 인터페이스 작성(암복호화 유틸)
   - secret 참조키 저장 구조 초안
4. 로그/진단 기초
   - 구조화 로그 포맷(`requestId`, `jobId`, `code`) 반영
   - 마스킹 훅(토큰/키 redaction) 기본 적용
5. UI 기초
   - 대시보드/마법사/설정/로그 화면 라우팅
   - 와이어프레임 기반 목업 상태 구현

### 산출물
- 실행 가능한 앱 셸(화면 전환 + 기본 IPC 호출)
- IPC 기본 계약 코드 초안
- 보안 저장소 유틸 초안
- 로그 마스킹 미들웨어 초안

### 완료 기준(DoD)
- 앱 실행 및 4개 핵심 화면 진입 가능
- Preload 화이트리스트 외 IPC 호출 차단 확인
- 민감정보 샘플 로그 마스킹 동작 확인
- 설정 읽기/저장 round-trip 성공

---

## Sprint 2: ACME 코어 구현

### 목표
- ACME 계정/오더/챌린지/Finalize의 기본 발급 시나리오 구현
- 스테이징 환경 기준 단일 도메인 발급 성공
- Job 기반 상태 이벤트(`event.job.progress/completed/failed`) 연동

### 작업 항목
1. ACME Client Service 구현
   - `directory`, `newNonce`, `newAccount`, `newOrder`, `finalize`, cert 다운로드
   - order/challenge polling + 백오프
2. Challenge Coordinator 구현
   - 도메인 규칙 엔진(wildcard => DNS-01 강제)
   - 도메인별 challenge 선택/분기
3. HTTP-01 최소 경로 구현
   - 파일 생성/배치/사전 접근 확인
   - 실패 원인 코드 매핑(`HTTP_CHALLENGE_FILE_UNREACHABLE` 등)
4. DNS-01 최소 경로 구현
   - ManualDnsAdapter 우선 구현
   - TXT 안내/전파 확인 기본 루틴
5. 저장소 반영
   - 인증서/체인 저장 + 메타데이터 등록
   - job 결과와 대시보드 목록 연동
6. UI 연동
   - 마법사에서 발급 요청/진행 상태/완료 결과 표시
   - 실패 시 카피 초안 기반 액션 버튼(재시도/진단) 노출

### 산출물
- 스테이징 기준 발급 가능한 ACME 코어
- Job 상태 이벤트 스트림
- HTTP-01/DNS-01(수동 중심) 최소 동작
- 대시보드 인증서 목록 갱신

### 완료 기준(DoD)
- 단일 도메인 DNS-01 발급 성공(스테이징)
- 단일 도메인 HTTP-01 발급 성공(스테이징, 테스트 웹루트)
- wildcard 입력 시 HTTP-01 비활성화 확인
- 실패 코드/메시지 매핑 및 UI 표시 확인

---

## Sprint 1~2 리스크 및 대응
- ACME rate limit: 기본 환경을 staging으로 고정하고 production 전환 경고 적용
- DNS 전파 지연: timeout/재확인 UX 우선 제공
- IPC 권한 오설계: 채널 화이트리스트 + 스키마 검증 테스트 병행
- 로그 유출: 마스킹 정책 테스트를 CI 사전 체크에 포함
