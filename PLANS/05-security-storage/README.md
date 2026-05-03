# 5단계: 보안 및 저장소 설계

## 보호 대상
- ACME 계정 개인키
- 도메인 인증서 개인키
- DNS API 자격증명

## 보안 정책
- 평문 저장 금지
- Windows DPAPI 기반 암호화 저장 우선
- 민감정보는 Main process에서만 복호화
- 로그에 비밀정보 마스킹

## 파일/데이터 구조
- `data/certificates/`: 발급 인증서/체인
- `data/keys/`: 암호화된 키 파일
- `data/config.db` 또는 `config.json.enc`

## 접근 제어
- IPC 화이트리스트
- Renderer에서 민감 API 직접 접근 금지
- 필요 시 앱 잠금 PIN(선택 기능) 고려

## 산출물
- 위협 모델(Threat Model)
- 키 관리 정책 문서
- 비밀정보 마스킹 정책
