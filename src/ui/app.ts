import { createRendererApi } from '../preload/api.js';
import { createDevRuntime } from '../main/dev-runtime.js';

let runtime: Awaited<ReturnType<typeof createDevRuntime>>;
let api: ReturnType<typeof createRendererApi>;


type Page = 'dashboard' | 'wizard' | 'settings' | 'logs';
let current: Page = 'dashboard';
let step = 1;
let statusText = '대기 중';
let accountKid = '미생성';
let settingsState: { acmeDirectoryUrl: string; defaultChallengeType: 'http-01' | 'dns-01'; staging: boolean } = { acmeDirectoryUrl: '', defaultChallengeType: 'http-01', staging: true };

const appRoot = document.getElementById('app');
if (!appRoot) throw new Error('app missing');
const app: HTMLElement = appRoot;

async function loadSettings() {
  const res = await api.getSettings();
  if (res.ok && res.data) {
    settingsState = res.data;
  }
}

async function saveSettings() {
  const res = await api.updateSettings(settingsState);
  statusText = res.ok ? '설정 저장 완료' : '설정 저장 실패';
  render();
}

async function createAcmeAccount() {
  statusText = 'ACME 계정 생성 중...';
  render();
  try {
    const result = await runtime.accountService.ensureAccount({
      directoryUrl: settingsState.acmeDirectoryUrl || 'https://acme-staging-v02.api.letsencrypt.org/directory',
      email: 'admin@example.com',
      acceptTos: true
    });
    accountKid = result.kid;
    statusText = 'ACME 계정 준비 완료';
  } catch (error) {
    statusText = `계정 생성 실패: ${(error as Error).message}`;
  }
  render();
}

async function runHttpPrecheck() {
  statusText = 'HTTP 사전 확인 중...';
  render();
  const file = runtime.httpService.buildChallengeFile({
    domain: 'example.com',
    token: 'sample-token',
    keyAuthorization: 'sample-key-auth'
  });
  const result = await runtime.httpService.precheck(file);
  statusText = result.ok ? 'HTTP 접근 확인 성공' : `HTTP 실패: ${result.reason ?? 'UNKNOWN'}`;
  render();
}

async function runDnsCheck() {
  statusText = 'DNS 전파 확인 중...';
  render();
  const result = await runtime.dnsService.wait({ domain: 'example.com', txtValue: 'txt-value' });
  statusText = result.propagated ? 'DNS 전파 확인 성공' : 'DNS 전파 대기(재시도 가능)';
  render();
}

function render() {
  app.innerHTML = `
    <nav>
      <h3>WinCertbot</h3>
      <button data-page="dashboard">대시보드</button>
      <button data-page="wizard">새 인증서 발급</button>
      <button data-page="settings">설정</button>
      <button data-page="logs">로그/진단</button>
      <hr/>
      <small>상태: ${statusText}</small>
    </nav>
    <main>${pageContent()}</main>
  `;

  app.querySelectorAll('button[data-page]').forEach((btn) => btn.addEventListener('click', () => { current = (btn as HTMLButtonElement).dataset.page as Page; render(); }));
  app.querySelectorAll('button[data-step]').forEach((btn) => btn.addEventListener('click', () => { step = Number((btn as HTMLButtonElement).dataset.step); render(); }));
  app.querySelectorAll('button[data-action="save-settings"]').forEach((btn) => btn.addEventListener('click', () => void saveSettings()));
  app.querySelectorAll('button[data-action="http-precheck"]').forEach((btn) => btn.addEventListener('click', () => void runHttpPrecheck()));
  app.querySelectorAll('button[data-action="dns-check"]').forEach((btn) => btn.addEventListener('click', () => void runDnsCheck()));
  app.querySelectorAll('button[data-action="create-account"]').forEach((btn) => btn.addEventListener('click', () => void createAcmeAccount()));

  const staging = app.querySelector<HTMLInputElement>('#staging-toggle');
  if (staging) {
    staging.addEventListener('change', () => {
      settingsState.staging = staging.checked;
      settingsState.acmeDirectoryUrl = staging.checked
        ? 'https://acme-staging-v02.api.letsencrypt.org/directory'
        : 'https://acme-v02.api.letsencrypt.org/directory';
    });
  }
}

function pageContent(): string {
  if (current === 'dashboard') return `<div class="card"><h2>대시보드</h2><p>실시간 상태: ${statusText}</p><p>ACME 계정: ${accountKid}</p><button data-action="create-account">계정 생성/확인</button></div><div class="card"><h3>인증서 목록</h3><table><tr><th>도메인</th><th>상태</th><th>만료일</th></tr><tr><td>example.com</td><td>VALID</td><td>2026-08-10</td></tr></table></div>`;
  if (current === 'wizard') return wizard();
  if (current === 'settings') return settings();
  return `<div class="card"><h3>로그/진단</h3><p>재시도/진단 액션은 마법사 단계에서 실행 가능합니다.</p></div>`;
}

function wizard(): string {
  const body = step===1?`<h3>Step1 도메인 입력</h3><input value="example.com"/>`:
    step===2?`<h3>Step2 Challenge 선택</h3><label><input type="radio"/> HTTP-01</label><label><input type="radio" checked/> DNS-01</label>`:
    step===3?`<h3>Step3A HTTP-01</h3><p>[ ] 파일 생성됨 [ ] 업로드 완료 [ ] 외부 접근 확인됨</p><button data-action="http-precheck">접근 확인(진단 실행)</button><button data-action="http-precheck">다시 시도</button>`:
    step===4?`<h3>Step3B DNS-01</h3><p>[ ] TXT 등록됨 [ ] 전파 확인됨 [ ] 검증 요청됨</p><button data-action="dns-check">전파 확인</button><button data-action="dns-check">재시도</button>`:
    `<h3>Step4 결과</h3><p>상태: ${statusText}</p><p>인증서 ID: cert-2026-0001</p><button data-page="dashboard">대시보드로 이동</button>`;
  return `<div class="card">${body}<div class="row"><button data-step="1">1</button><button data-step="2">2</button><button data-step="3">3(HTTP)</button><button data-step="4">3(DNS)</button><button data-step="5">4(결과)</button></div></div>`;
}

function settings(): string {
  return `<div class="card"><h3>설정</h3>
  <label><input id="staging-toggle" type="checkbox" ${settingsState.staging ? 'checked' : ''}/> Staging 사용</label>
  <p>Directory: ${settingsState.acmeDirectoryUrl}</p>
  <button data-action="save-settings">설정 저장</button>
  </div>`;
}

void createDevRuntime().then((rt) => {
  runtime = rt;
  api = createRendererApi((channel, payload) => runtime.router.handle(channel, payload));
  return loadSettings();
}).then(render);
