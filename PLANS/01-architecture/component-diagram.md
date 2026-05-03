# 컴포넌트 다이어그램 (Component Diagram)

## 시스템 경계
- Desktop App: Electron 기반 `win-certbot-gui`
- External Systems: Let's Encrypt ACME API, DNS Provider API, 대상 웹서버(HTTP-01)

## 컴포넌트 구조

```mermaid
flowchart LR
    subgraph UI[Renderer Process (React UI)]
        A1[Dashboard]
        A2[Issue/Renew Wizard]
        A3[Settings]
        A4[Logs & Diagnostics]
    end

    subgraph PRELOAD[Preload Bridge]
        B1[Typed IPC API]
    end

    subgraph MAIN[Main Process]
        C1[IPC Router]
        C2[Job Queue / Worker Orchestrator]
        C3[State Store Adapter]
        C4[Log Service]
    end

    subgraph CORE[Core Domain Modules]
        D1[ACME Client Service]
        D2[Challenge Coordinator]
        D3[HTTP-01 Handler]
        D4[DNS-01 Handler]
        D5[Security Service
DPAPI/Credential Masking]
        D6[Certificate Repository]
        D7[Renewal Scheduler]
    end

    subgraph EXT[External]
        E1[Let's Encrypt ACME Directory]
        E2[DNS Provider APIs]
        E3[Web Server / Web Root]
        E4[Filesystem
certs/keys/config/logs]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1

    B1 --> C1
    C1 --> C2
    C1 --> C3
    C1 --> C4

    C2 --> D1
    C2 --> D2
    D2 --> D3
    D2 --> D4
    C2 --> D6
    C2 --> D7

    D1 <--> E1
    D4 <--> E2
    D3 <--> E3

    D5 --> D6
    D6 <--> E4
    C3 <--> E4
    C4 <--> E4
```

## 책임 분리 원칙
- Renderer는 화면/입력/상태 표시만 담당하고, 민감 연산(키 복호화, 토큰 처리)은 Main/Core만 수행.
- IPC는 Preload에서 화이트리스트 API만 노출.
- ACME/Challenge/보안/저장소를 독립 모듈로 분리해 테스트성과 교체 가능성 확보.

## 모듈별 책임
- `Dashboard`: 인증서 목록, 만료 임박 경고, 최근 작업 표시
- `Issue/Renew Wizard`: 도메인 입력, challenge 선택, 진행 상태 표시
- `IPC Router`: 채널 검증, payload 스키마 검증, 권한 체크
- `Job Queue`: 장시간 작업(발급/갱신/전파 대기) 비동기 오케스트레이션
- `ACME Client Service`: 계정/오더/인증/Finalize/인증서 다운로드
- `Challenge Coordinator`: 도메인별 challenge 전략 선택(와일드카드 DNS-01 강제)
- `HTTP-01 Handler`: 토큰 파일 생성/배치/사전 접근 확인/정리
- `DNS-01 Handler`: TXT 레코드 생성/전파 확인/삭제
- `Security Service`: DPAPI 암복호화, 로그 마스킹, secret redaction
- `Certificate Repository`: 인증서 메타데이터, 파일 경로, 상태 저장
- `Renewal Scheduler`: 만료일 기반 갱신 시점 계산 및 트리거
