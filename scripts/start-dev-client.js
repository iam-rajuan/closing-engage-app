/* global __dirname */

const path = require('path');
const { spawn, spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const env = { ...process.env };
const reversePorts = ['8081', '19000', '19001', '19002'];

function hasConnectedAndroidDevice() {
  const result = spawnSync('adb', ['devices'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
  });

  if ((result.status ?? 1) !== 0) {
    return false;
  }

  return /\tdevice\r?$/m.test(result.stdout);
}

function ensureAdbReverse() {
  if (!hasConnectedAndroidDevice()) {
    return;
  }

  for (const port of reversePorts) {
    spawnSync('adb', ['reverse', `tcp:${port}`, `tcp:${port}`], {
      stdio: 'ignore',
      env,
    });
  }
}

function startExpoDevClient() {
  const expoCli = path.join(projectRoot, 'node_modules', '@expo', 'cli', 'main.js');
  const child = spawn(process.execPath, [expoCli, 'start', '--dev-client', '--localhost', '--android'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

ensureAdbReverse();
startExpoDevClient();
