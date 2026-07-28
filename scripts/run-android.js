/* global __dirname */

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const androidAppId = 'com.closingengage.app';
const androidMainActivity = `${androidAppId}/.MainActivity`;

const buildDirs = [
  'android/build',
  'android/app/build',
  'android/app/.cxx',
  'android/app/build/generated/autolinking',
];


function stopGradleDaemons() {
  const gradleWrapper = path.join(projectRoot, 'android', isWindows ? 'gradlew.bat' : 'gradlew');

  if (!fs.existsSync(gradleWrapper)) {
    return;
  }

  spawnSync(gradleWrapper, ['--stop'], {
    cwd: path.join(projectRoot, 'android'),
    stdio: 'inherit',
    env,
  });
}

function stopProjectNodeProcesses() {
  if (!isWindows || env.CLOSING_ENGAGE_KILL_NODE === '1') {
    return;
  }
}

function collectNodeModulesAndroidArtifacts(root = projectRoot) {
  const nodeModulesRoot = path.join(root, 'node_modules');
  const collected = new Set();
  const androidPathSegment = `${path.sep}android${path.sep}`;

  function visit(dir) {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      const parentPath = path.dirname(fullPath);

      if (
        (entry.name === 'build' || entry.name === '.cxx') &&
        (parentPath.includes(androidPathSegment) || parentPath.toLowerCase().includes('gradle-plugin'))
      ) {
        collected.add(fullPath);
      }

      if (entry.name === 'android') {
        collected.add(path.join(fullPath, 'build'));
        collected.add(path.join(fullPath, '.cxx'));
      }

      visit(fullPath);
    }
  }

  visit(nodeModulesRoot);
  return [...collected];
}

function removeDirectoryIfPresent(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return true;
  }

  if (isWindows) {
    spawnSync('cmd', ['/c', 'attrib', '-R', targetPath, '/S', '/D'], {
      stdio: 'ignore',
      env,
    });
  }

  try {
    fs.rmSync(targetPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch (error) {
    if (!isWindows) {
      console.warn(`Unable to remove ${targetPath}: ${error.message}`);
      return false;
    }

    spawnSync(
      'powershell',
      [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        `if (Test-Path -LiteralPath '${targetPath.replace(/'/g, "''")}') { Remove-Item -LiteralPath '${targetPath.replace(/'/g, "''")}' -Recurse -Force -ErrorAction SilentlyContinue }`,
      ],
      {
        stdio: 'ignore',
        env,
      }
    );

    spawnSync('cmd', ['/c', 'rmdir', '/S', '/Q', targetPath], {
      stdio: 'ignore',
      env,
    });

    try {
      fs.rmSync(targetPath, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
    } catch (finalError) {
      if (fs.existsSync(targetPath)) {
        console.warn(`Unable to fully remove ${targetPath}: ${finalError.message}`);
        return false;
      }
    }
  }

  return !fs.existsSync(targetPath);
}

const env = { ...process.env };
if (!env.NODE_ENV) {
  env.NODE_ENV = 'development';
}
env.CLOSING_ENGAGE_SKIP_RUN_ANDROID_WRAPPER = '1';
env.CI = env.CI || '1';
env.EXPO_NO_INTERACTIVE = env.EXPO_NO_INTERACTIVE || '1';

function runAdbCommand(args) {
  const result = spawnSync('adb', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
  });

  if (result.status !== 0) {
    return '';
  }

  return result.stdout.trim();
}

function runCommand(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
    ...options,
  });
}

function getPortListeners(port) {
  const result = runCommand('netstat', ['-ano']);
  if ((result.status ?? 1) !== 0) {
    return [];
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line.includes('LISTENING'))
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts.length >= 5)
    .filter((parts) => {
      const localAddress = parts[1];
      return localAddress.endsWith(`:${port}`);
    })
    .map((parts) => ({
      protocol: parts[0],
      localAddress: parts[1],
      pid: Number(parts[4]),
    }))
    .filter((entry) => Number.isFinite(entry.pid));
}

function isPortListening(port) {
  return getPortListeners(port).length > 0;
}

function hasReachableMetroListener(port) {
  const listeners = getPortListeners(port);
  return listeners.some(({ localAddress }) => {
    const normalized = localAddress.toLowerCase();
    return (
      normalized.startsWith('0.0.0.0:') ||
      normalized.startsWith('[::]:') ||
      (!normalized.startsWith('127.0.0.1:') && !normalized.startsWith('[::1]:'))
    );
  });
}

function stopProcessByPid(pid) {
  if (!Number.isFinite(pid) || pid <= 0) {
    return;
  }

  if (isWindows) {
    runCommand('taskkill', ['/PID', String(pid), '/T', '/F']);
    return;
  }

  runCommand('kill', ['-9', String(pid)]);
}

function stopMetroListeners(port) {
  const listeners = getPortListeners(port);
  const pids = [...new Set(listeners.map(({ pid }) => pid))];
  for (const pid of pids) {
    stopProcessByPid(pid);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isMetroReady(port) {
  const hosts = ['localhost', '127.0.0.1', '::1'];

  return new Promise((resolve) => {
    let pending = hosts.length;

    const finish = (result) => {
      if (result) {
        resolve(true);
        return true;
      }

      pending -= 1;
      if (pending === 0) {
        resolve(false);
      }
      return false;
    };

    for (const host of hosts) {
      const request = http.get(
        {
          host,
          port: Number(port),
          path: '/status',
          timeout: 2000,
        },
        (response) => {
          let data = '';
          response.setEncoding('utf8');
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', () => {
            finish(data.includes('packager-status:running'));
          });
        }
      );

      request.on('timeout', () => {
        request.destroy();
        finish(false);
      });

      request.on('error', () => {
        finish(false);
      });
    }
  });
}

function getConnectedDeviceAbi() {
  if (!isWindows) {
    return '';
  }

  const explicitArch = env.REACT_NATIVE_ARCHITECTURES || env.ORG_GRADLE_PROJECT_reactNativeArchitectures;
  if (explicitArch) {
    return explicitArch;
  }

  const primaryAbi = runAdbCommand(['shell', 'getprop', 'ro.product.cpu.abi']);
  if (primaryAbi) {
    return primaryAbi;
  }

  const abiList = runAdbCommand(['shell', 'getprop', 'ro.product.cpu.abilist']);
  if (!abiList) {
    return '';
  }

  return abiList
    .split(',')
    .map((abi) => abi.trim())
    .find(Boolean) || '';
}

const connectedDeviceAbi = getConnectedDeviceAbi();
if (connectedDeviceAbi) {
  env.ORG_GRADLE_PROJECT_reactNativeArchitectures = connectedDeviceAbi;
}

function ensureDirectory(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function copyFileIfMissing(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath) || fs.existsSync(targetPath)) {
    return;
  }

  ensureDirectory(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

function downloadFile(url, targetPath) {
  ensureDirectory(path.dirname(targetPath));

  const result = spawnSync(
    'powershell',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      `Invoke-WebRequest -Uri '${url}' -OutFile '${targetPath.replace(/'/g, "''")}'`,
    ],
    {
      stdio: 'inherit',
      env,
    }
  );

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0 || !fs.existsSync(targetPath)) {
    process.exit(result.status ?? 1);
  }
}

function configureReactNativeDownloadsCache(root) {
  const rnVersion = '0.86.0';
  const cacheRoot = path.join(os.homedir(), '.react-native-downloads', rnVersion);
  const existingDownloadsDir = path.join(root, 'node_modules', 'react-native', 'ReactAndroid', 'build', 'downloads');
  const requiredArchives = [
    {
      name: 'boost_1_83_0.tar.gz',
      url: 'https://archives.boost.io/release/1.83.0/source/boost_1_83_0.tar.gz',
    },
    {
      name: 'double-conversion-1.1.6.tar.gz',
      url: 'https://github.com/google/double-conversion/archive/v1.1.6.tar.gz',
    },
    {
      name: 'fast_float-8.0.0.tar.gz',
      url: 'https://github.com/fastfloat/fast_float/archive/v8.0.0.tar.gz',
    },
    {
      name: 'fmt-12.1.0.tar.gz',
      url: 'https://github.com/fmtlib/fmt/archive/12.1.0.tar.gz',
    },
    {
      name: 'folly-2024.11.18.00.tar.gz',
      url: 'https://github.com/facebook/folly/archive/v2024.11.18.00.tar.gz',
    },
    {
      name: 'glog-0.3.5.tar.gz',
      url: 'https://github.com/google/glog/archive/v0.3.5.tar.gz',
    },
  ];

  ensureDirectory(cacheRoot);

  for (const archive of requiredArchives) {
    const sourcePath = path.join(existingDownloadsDir, archive.name);
    const targetPath = path.join(cacheRoot, archive.name);
    copyFileIfMissing(sourcePath, targetPath);

    if (!fs.existsSync(targetPath)) {
      console.log(`Downloading React Native native dependency ${archive.name}...`);
      downloadFile(archive.url, targetPath);
    }
  }

  env.REACT_NATIVE_DOWNLOADS_DIR = cacheRoot;
}

configureReactNativeDownloadsCache(projectRoot);

stopGradleDaemons();
stopProjectNodeProcesses();

const allBuildDirs = [...buildDirs.map((dir) => path.join(projectRoot, dir)), ...collectNodeModulesAndroidArtifacts()];

for (const fullPath of allBuildDirs) {
  removeDirectoryIfPresent(fullPath);
}

function getMappedProjectRoot() {
  if (!isWindows) {
    return { cwd: projectRoot, cleanup: () => {} };
  }

  const driveRoot = path.parse(projectRoot).root;
  const shortBuildRoot = path.join(driveRoot, 'cea-build');
  const mirrorRoot = path.join(shortBuildRoot, path.basename(projectRoot));
  fs.mkdirSync(shortBuildRoot, { recursive: true });

  for (const dir of buildDirs) {
    removeDirectoryIfPresent(path.join(mirrorRoot, dir));
  }

  for (const dir of collectNodeModulesAndroidArtifacts(mirrorRoot)) {
    removeDirectoryIfPresent(dir);
  }

  const robocopyArgs = [
    projectRoot,
    mirrorRoot,
    '/MIR',
    '/R:1',
    '/W:1',
    '/FFT',
    '/XJ',
    '/NFL',
    '/NDL',
    '/NJH',
    '/NJS',
    '/NP',
    '/XD',
    path.join(projectRoot, 'android', 'build'),
    path.join(projectRoot, 'android', 'app', 'build'),
    path.join(projectRoot, 'android', 'app', '.cxx'),
    path.join(projectRoot, '.git'),
    path.join(projectRoot, '.expo'),
    path.join(projectRoot, 'dist'),
  ];

  const syncResult = runCommand('robocopy', robocopyArgs);
  if ((syncResult.status ?? 16) >= 8) {
    if (syncResult.stdout) {
      process.stdout.write(syncResult.stdout);
    }
    if (syncResult.stderr) {
      process.stderr.write(syncResult.stderr);
    }
    console.warn(`robocopy reported a non-fatal sync issue (exit code ${syncResult.status}); continuing with the mirror path.`);
  }

  const mappedRoot = mirrorRoot;
  if (!fs.existsSync(path.join(mappedRoot, 'package.json'))) {
    return { cwd: projectRoot, cleanup: () => {} };
  }

  return {
    cwd: mappedRoot,
    cleanup: () => {},
  };
}

function ensureCommandSucceeded(result) {
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

function getGradleWrapper(root) {
  return path.join(root, 'android', isWindows ? 'gradlew.bat' : 'gradlew');
}

function buildDebugApk(root) {
  const gradleWrapper = getGradleWrapper(root);
  const gradleArgs = ['app:assembleDebug', '-x', 'lint', '-x', 'test'];

  const devServerPort = env.REACT_NATIVE_DEV_SERVER_PORT || '8081';
  gradleArgs.push(`-PreactNativeDevServerPort=${devServerPort}`);

  if (env.ORG_GRADLE_PROJECT_reactNativeArchitectures) {
    gradleArgs.push(`-PreactNativeArchitectures=${env.ORG_GRADLE_PROJECT_reactNativeArchitectures}`);
  }

  const result = isWindows
    ? spawnSync(gradleWrapper, gradleArgs, {
        cwd: path.join(root, 'android'),
        stdio: 'inherit',
        env,
        shell: true,
      })
    : spawnSync(gradleWrapper, gradleArgs, {
        cwd: path.join(root, 'android'),
        stdio: 'inherit',
        env,
      });

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function ensureMetroServer() {
  const port = env.REACT_NATIVE_DEV_SERVER_PORT || '8081';
  if (await isMetroReady(port) && hasReachableMetroListener(port)) {
    return;
  }

  if (isPortListening(port) && !hasReachableMetroListener(port)) {
    console.log(`Restarting Metro on port ${port} because the existing listener is loopback-only.`);
    stopMetroListeners(port);
    await wait(2000);
  }

  const expoCli = path.join(projectRoot, 'node_modules', '@expo', 'cli', 'main.js');
  const expoLogDir = path.join(projectRoot, '.expo');
  const expoLogPath = path.join(expoLogDir, 'metro.log');

  ensureDirectory(expoLogDir);
  const logStream = fs.openSync(expoLogPath, 'a');

  const child = spawn(process.execPath, [expoCli, 'start', '--dev-client', '--host', 'lan', '--port', port, '--clear'], {
    cwd: projectRoot,
    detached: true,
    stdio: ['ignore', logStream, logStream],
    env,
    windowsHide: true,
  });

  child.unref();
  console.log(`Started Metro in the background on port ${port}. Logs: ${expoLogPath}`);

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if ((await isMetroReady(port)) && hasReachableMetroListener(port)) {
      return;
    }
    await wait(1000);
  }

  throw new Error(`Metro did not become ready on port ${port}. Check ${expoLogPath}`);
}

function ensureAdbReverse() {
  const reversePorts = ['8081', '19000', '19001', '19002'];
  for (const port of reversePorts) {
    runCommand('adb', ['reverse', `tcp:${port}`, `tcp:${port}`]);
  }
}

function installAndLaunchDebugApk(root) {
  const apkPath = path.join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

  if (!fs.existsSync(apkPath)) {
    console.warn(`Debug APK was not found at ${apkPath}`);
    return;
  }

  const adbDevices = runCommand('adb', ['devices']);
  if ((adbDevices.status ?? 1) !== 0 || !/\tdevice\r?$/m.test(adbDevices.stdout)) {
    if (adbDevices.stdout) {
      process.stdout.write(adbDevices.stdout);
    }
    if (adbDevices.stderr) {
      process.stderr.write(adbDevices.stderr);
    }
    console.warn('Skipping APK install because no connected Android device was detected.');
    return;
  }

  ensureAdbReverse();
  ensureCommandSucceeded(runCommand('adb', ['install', '-r', apkPath]));
  ensureCommandSucceeded(runCommand('adb', ['shell', 'am', 'start', '-n', androidMainActivity]));
}

const { cwd, cleanup } = getMappedProjectRoot();
async function main() {
  const { cwd, cleanup } = getMappedProjectRoot();
  try {
    await ensureMetroServer();
    buildDebugApk(cwd);
    installAndLaunchDebugApk(cwd);
  } finally {
    cleanup();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
