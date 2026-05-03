import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tscCliPath = resolve(rootDir, 'node_modules/typescript/bin/tsc');

await execFileAsync(process.execPath, [tscCliPath, '-p', 'tsconfig.json'], { cwd: rootDir });

const distUiDir = resolve(rootDir, 'dist/ui');
await mkdir(distUiDir, { recursive: true });
await cp(resolve(rootDir, 'src/ui/index.html'), resolve(distUiDir, 'index.html'));
await cp(resolve(rootDir, 'src/ui/styles.css'), resolve(distUiDir, 'styles.css'));
