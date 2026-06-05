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
  if (!isWindows) {
    return;
  }

  const escapedProjectRoot = projectRoot.replace(/\\/g, '\\\\').replace(/'/g, "''");
  spawnSync(
    'powershell',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      [
        `$projectPattern = [Regex]::Escape('${escapedProjectRoot}')`,
        "$processes = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match $projectPattern }",
        "foreach ($process in $processes) {",
        '  try {',
        '    Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop',
        '  } catch {',
        '  }',
        '}',
      ].join('; '),
    ],
    {
      stdio: 'ignore',
      env,
    }
  );
}

function collectNodeModulesAndroidArtifacts() {
  const nodeModulesRoot = path.join(projectRoot, 'node_modules');
  const collected = [];

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

      if (entry.name === 'android') {
        collected.push(path.join(fullPath, 'build'));
        collected.push(path.join(fullPath, '.cxx'));
        continue;
      }

      visit(fullPath);
    }
  }

  visit(nodeModulesRoot);
  return collected;
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

  const projectDriveRoot = path.parse(projectRoot).root;
  const junctionRoot = path.join(projectDriveRoot, 'cea');
  const currentTarget = fs.existsSync(junctionRoot) ? fs.realpathSync.native(junctionRoot) : null;

  if (currentTarget && path.resolve(currentTarget) !== path.resolve(projectRoot)) {
    return { cwd: projectRoot, cleanup: () => {} };
  }

  if (!currentTarget) {
    const createResult = spawnSync(
      'cmd',
      ['/c', 'mklink', '/J', junctionRoot, projectRoot],
      { stdio: 'inherit', env }
    );

    if (createResult.status !== 0) {
      return { cwd: projectRoot, cleanup: () => {} };
    }
  }

  return {
    cwd: junctionRoot,
    cleanup: () => {},
  };
}

const { cwd, cleanup } = getMappedProjectRoot();
const expoCli = path.join(cwd, 'node_modules', 'expo', 'bin', 'cli');
const args = [expoCli, 'run:android', '--no-build-cache', ...process.argv.slice(2)];

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
