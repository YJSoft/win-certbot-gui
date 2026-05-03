# 시퀀스 다이어그램 (ACME API 호출 순서)

아래 다이어그램은 도메인 입력 이후 ACME 발급이 완료될 때까지의 표준 호출 순서를 표현한다.

```mermaid
sequenceDiagram
    autonumber
    participant UI as Renderer(UI Wizard)
    participant MAIN as Main/Job Orchestrator
    participant ACME as ACME Client Service
    participant CH as Challenge Handler(HTTP-01 or DNS-01)
    participant LE as Let's Encrypt ACME Server
    participant DNSHTTP as DNS API / Web Server
    participant REPO as Certificate Repository

    UI->>MAIN: cert.issue.request(domains, challenge, env)
    MAIN->>MAIN: 입력 검증 + wildcard 규칙 적용
    MAIN->>ACME: initAccountOrLoadKey()

    ACME->>LE: GET directory
    LE-->>ACME: directory endpoints

    ACME->>LE: POST newNonce
    LE-->>ACME: replay-nonce

    ACME->>LE: POST newAccount (or existing account lookup)
    LE-->>ACME: account URL(KID)

    ACME->>LE: POST newOrder(identifiers)
    LE-->>ACME: order + authorizations[] + finalize URL

    loop for each authorization
        ACME->>LE: GET authorization URL
        LE-->>ACME: challenges(http-01/dns-01)

        ACME->>CH: prepareChallenge(authz, selectedType)
        alt HTTP-01
            CH->>DNSHTTP: 토큰 파일 배치(.well-known/...)
            CH->>DNSHTTP: HTTP 접근 사전 확인
            DNSHTTP-->>CH: 200 OK or 오류
        else DNS-01
            CH->>DNSHTTP: DNS TXT 생성(_acme-challenge)
            CH->>DNSHTTP: 전파 확인(다중 resolver)
            DNSHTTP-->>CH: propagated or timeout
        end

        ACME->>LE: POST challenge URL (ready)
        LE-->>ACME: challenge status = pending

        loop poll until terminal
            ACME->>LE: POST-as-GET challenge URL
            LE-->>ACME: pending | processing | valid | invalid
        end
    end

    ACME->>ACME: CSR 생성 (CN/SAN)
    ACME->>LE: POST finalize(CSR)
    LE-->>ACME: order status = processing/valid

    loop poll order
        ACME->>LE: POST-as-GET order URL
        LE-->>ACME: processing | valid | invalid
    end

    ACME->>LE: POST-as-GET certificate URL
    LE-->>ACME: certificate chain (PEM)

    ACME->>CH: cleanupChallengeArtifacts()
    ACME->>REPO: saveCertificateAndMetadata()
    REPO-->>ACME: certificateId

    ACME-->>MAIN: issue completed(certificateId, expiresAt)
    MAIN-->>UI: event.job.completed
```

## 구현 메모
- wildcard 도메인 포함 시 challenge 선택은 DNS-01로 강제.
- challenge polling과 order polling은 백오프(예: 2s, 4s, 8s) 적용.
- `invalid` 수신 시 즉시 원인 분류(HTTP 접근 실패, DNS 전파 실패, rate limit 등).
