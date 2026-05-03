# IPC 계약서 (API 스펙)

## 설계 원칙
- 모든 IPC는 Preload를 통해 노출된 타입드 API로만 접근
- Renderer는 파일시스템/키 복호화/API 토큰 원문 접근 금지
- Request/Response는 JSON 스키마 유사 구조 사용
- 장시간 작업은 `jobId` + 이벤트 스트림으로 진행 상태 전달

---

## 1) 채널 목록

### 1.1 인증서 발급/갱신
- `cert.issue.request`
- `cert.renew.request`
- `cert.job.cancel`
- `cert.job.status.get`

### 1.2 조회/관리
- `cert.list.get`
- `cert.detail.get`
- `cert.export.pem`

### 1.3 설정/환경
- `settings.get`
- `settings.update`
- `environment.switch` (staging/production)

### 1.4 로그/진단
- `log.list.get`
- `diagnostics.http.check`
- `diagnostics.dns.propagation.check`

### 1.5 이벤트
- `event.job.progress`
- `event.job.completed`
- `event.job.failed`
- `event.cert.expiry.warning`

---

## 2) 공통 타입

```ts
type Environment = 'staging' | 'production';
type ChallengeType = 'http-01' | 'dns-01';
type JobStatus =
  | 'DRAFT' | 'VALIDATING_INPUT' | 'ACCOUNT_READY' | 'ORDER_CREATED'
  | 'CHALLENGE_PENDING' | 'CHALLENGE_VALID' | 'FINALIZING'
  | 'ISSUED' | 'FAILED' | 'CANCELLED';

interface ApiError {
  code: string;                // e.g. INVALID_DOMAIN, DNS_PROPAGATION_TIMEOUT
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: ApiError;
  requestId: string;
  timestamp: string;           // ISO-8601
}
```

---

## 3) 주요 API 상세

### 3.1 `cert.issue.request`
**Request**
```ts
interface CertIssueRequest {
  domains: string[];           // CN + SAN 목록
  preferredChallenge?: ChallengeType;
  environment: Environment;
  webrootPath?: string;        // http-01 사용 시
  dnsProviderId?: string;      // dns-01 사용 시
  dnsCredentialRef?: string;   // 저장된 자격증명 참조키
  exportPath?: string;
  cleanupChallengeArtifacts?: boolean;
}
```

**Response**
```ts
interface CertIssueAccepted {
  jobId: string;
  normalizedDomains: string[];
  enforcedChallenge: ChallengeType; // wildcard 포함 시 dns-01
}
```

**Validation Rules**
- `domains`는 1개 이상
- wildcard 포함 시 `enforcedChallenge = 'dns-01'`
- `http-01` 선택 시 `webrootPath` 필수

### 3.2 `cert.renew.request`
```ts
interface CertRenewRequest {
  certificateId: string;
  environment?: Environment;
  force?: boolean;
}
```

### 3.3 `cert.list.get`
```ts
interface CertificateSummary {
  id: string;
  primaryDomain: string;
  sans: string[];
  challengeUsed: ChallengeType;
  issuedAt: string;
  expiresAt: string;
  daysLeft: number;
  status: 'valid' | 'expiring' | 'expired' | 'failed';
}
```

### 3.4 `cert.export.pem`
```ts
interface CertExportRequest {
  certificateId: string;
  includePrivateKey: boolean;
  targetDirectory: string;
}
```

---

## 4) 이벤트 스펙

### 4.1 `event.job.progress`
```ts
interface JobProgressEvent {
  jobId: string;
  status: JobStatus;
  step: string;                // human-readable step
  progressPct?: number;        // 0-100
  message?: string;
  timestamp: string;
}
```

### 4.2 `event.job.completed`
```ts
interface JobCompletedEvent {
  jobId: string;
  certificateId: string;
  certPath: string;
  chainPath: string;
  keyPathRef: string;          // 키 파일 실제 경로 대신 참조 ID
  expiresAt: string;
}
```

### 4.3 `event.job.failed`
```ts
interface JobFailedEvent {
  jobId: string;
  status: JobStatus;
  error: ApiError;
  failedAtStep: string;
  suggestedActions?: string[];
}
```

---

## 5) 보안 및 권한 규칙
- Preload 미등록 채널 호출 차단
- Renderer에서 비밀값 원문 반환 금지 (`dnsCredentialRef`만 사용)
- 로그 이벤트는 토큰/키 문자열 자동 마스킹
- 파일 경로 입력은 allowlist 경로 정책 및 경로 정규화 적용
- Production 전환(`environment.switch`)은 사용자 확인 플래그 필요

## 6) 오류 코드 권장 목록
- `INVALID_DOMAIN`
- `WILDCARD_REQUIRES_DNS01`
- `HTTP_CHALLENGE_FILE_UNREACHABLE`
- `DNS_PROPAGATION_TIMEOUT`
- `ACME_RATE_LIMITED`
- `ACME_ORDER_INVALID`
- `SECRET_ACCESS_DENIED`
- `EXPORT_PATH_NOT_WRITABLE`
