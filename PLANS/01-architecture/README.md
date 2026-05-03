# 1단계: 아키텍처 설계

## 기술 스택 제안
- **Frontend(UI)**: Electron + React + TypeScript
- **Main Process**: Electron Main + Node.js(TypeScript)
- **ACME 클라이언트 레이어**: Node용 ACME 라이브러리(예: acme-client 계열) 래핑
- **상태 저장**: SQLite 또는 경량 JSON + 암호화 저장소
- **로깅**: pino/winston 기반 파일 로깅

## 모듈 구조
1. `ui/`
   - 인증서 발급 마법사
   - 도메인 목록/상태 화면
   - 로그 뷰어
2. `main/`
   - IPC 라우팅
   - 작업 큐/백그라운드 실행
   - 파일 시스템 접근
3. `core/acme/`
   - 계정 등록/재사용
   - Order 생성/Challenge 처리/Finalize
4. `core/challenge/`
   - http-01 핸들러
   - dns-01 핸들러
5. `core/security/`
   - 키 생성/암호화 저장
6. `core/scheduler/`
   - 갱신 시점 계산
   - 주기적 점검 작업

## 프로세스 모델
- Renderer ↔ Main IPC 분리
- 민감한 키 작업은 Main/Core에서만 수행
- Preload 스크립트로 최소 권한 API만 노출

## 산출물
- 컴포넌트 다이어그램
- 데이터 흐름도(도메인 입력 → ACME 발급 → 결과 저장)
- IPC 계약서(API 스펙)
