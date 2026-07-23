/* global __dirname */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';

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

function collectNodeModulesAndroidArtifacts() {
  const nodeModulesRoot = path.join(projectRoot, 'node_modules');
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
    return { cwd: projectRoot, cleanup: () => {} };
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

const forwardedArgs = process.argv.slice(2);
if (forwardedArgs[0] === 'run:android') {
  forwardedArgs.shift();
}

const { cwd, cleanup } = getMappedProjectRoot();
const expoCli = path.join(cwd, 'node_modules', '@expo', 'cli', 'main.js');
const args = [expoCli, 'run:android', '--no-build-cache', ...forwardedArgs];

const result = spawnSync(process.execPath, args, {
  cwd,
  stdio: 'inherit',
  env,
});

cleanup();

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
