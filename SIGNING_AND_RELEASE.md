# Signing / Notarization / Release Guide

## 1) Optional code signing policy
This project attempts signing **only when required secrets are present**.
If secrets are missing, build continues without signing.

## 2) GitHub Secrets
### Windows (EV/PFX)
- `WIN_CSC_LINK` (base64 또는 URL)
- `WIN_CSC_KEY_PASSWORD`

### macOS signing/notarization
- `APPLE_TEAM_ID`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `CSC_LINK` (Developer ID Application cert)
- `CSC_KEY_PASSWORD`

## 3) Auto update feed (GitHub Releases)
- electron-builder `publish.provider=github` 사용
- 태그(`v*`) push 시 release workflow가 draft release 생성 + 아티팩트 업로드

## 4) 로컬 확인
- `npm run dist -- --mac --x64 --arm64`
- `npm run dist -- --win --x64 --arm64`
