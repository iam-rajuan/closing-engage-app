/* global __dirname */

const path = require('path');
const { spawn, spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
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

function execExpoRunAndroid() {
  const expoCli = path.join(projectRoot, 'node_modules', '@expo', 'cli', 'main.js');
  const child = spawn(process.execPath, [expoCli, 'run:android', '--port', '8081'], {
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

stopGradleDaemons();
stopMetroListeners(8081);
clearAdbReverse();
execExpoRunAndroid();
