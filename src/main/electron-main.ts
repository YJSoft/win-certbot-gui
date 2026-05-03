import { app, BrowserWindow } from 'electron';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));

function resolveUiEntry(): string {
  const builtUiPath = join(currentDir, '../ui/index.html');
  if (existsSync(builtUiPath)) {
    return builtUiPath;
  }

  return join(currentDir, '../../src/ui/index.html');
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  win.loadFile(resolveUiEntry());
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
