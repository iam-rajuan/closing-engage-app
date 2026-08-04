/* global __dirname */

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const shortProjectRoot = isWindows
  ? process.env.CLOSING_ENGAGE_ANDROID_SHORT_PATH || path.join(path.parse(projectRoot).root, 'cea-app')
  : projectRoot;
const env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || 'development',
  EXPO_NO_INTERACTIVE: '0',
};

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
    ...options,
  });
}

function stopGradleDaemons() {
  const gradleWrapper = path.join(projectRoot, 'android', isWindows ? 'gradlew.bat' : 'gradlew');
  const gradleDir = path.join(projectRoot, 'android');

  run(gradleWrapper, ['--stop'], {
    cwd: gradleDir,
    shell: isWindows,
  });
}

function getPortListeners(port) {
  const netstat = run('netstat', ['-ano']);
  if ((netstat.status ?? 1) !== 0) {
    return [];
  }

  return netstat.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line.includes('LISTENING'))
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts.length >= 5 && parts[1].endsWith(`:${port}`))
    .map((parts) => Number(parts[4]))
    .filter((pid) => Number.isFinite(pid) && pid > 0);
}

function stopProcess(pid) {
  if (!Number.isFinite(pid) || pid <= 0) {
    return;
  }

  if (isWindows) {
    run('taskkill', ['/PID', String(pid), '/T', '/F']);
    return;
  }

  run('kill', ['-9', String(pid)]);
}

function stopMetroListeners(port) {
  const uniquePids = [...new Set(getPortListeners(port))];
  for (const pid of uniquePids) {
    stopProcess(pid);
  }
}

function clearAdbReverse() {
  const ports = ['8081', '19000', '19001', '19002'];
  for (const port of ports) {
    run('adb', ['reverse', '--remove', `tcp:${port}`]);
  }
}

function ensureShortProjectRoot() {
  if (!isWindows) {
    return projectRoot;
  }

  if (path.resolve(shortProjectRoot) === path.resolve(projectRoot)) {
    return projectRoot;
  }

  try {
    const stats = fs.lstatSync(shortProjectRoot);
    if (stats.isSymbolicLink()) {
      const existingTarget = fs.realpathSync(shortProjectRoot);
      if (path.resolve(existingTarget) === path.resolve(projectRoot)) {
        return shortProjectRoot;
      }
    }

    fs.rmSync(shortProjectRoot, { recursive: true, force: true });
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error;
    }
  }

  fs.symlinkSync(projectRoot, shortProjectRoot, 'junction');
  return shortProjectRoot;
}

function execExpoRunAndroid() {
  const buildRoot = ensureShortProjectRoot();
  const expoCli = path.join(buildRoot, 'node_modules', '@expo', 'cli', 'main.js');
  const child = spawn(process.execPath, [expoCli, 'run:android', '--port', '8081'], {
    cwd: buildRoot,
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

stopGradleDaemons();
stopMetroListeners(8081);
clearAdbReverse();
execExpoRunAndroid();
