/* global __dirname */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');

const buildDirs = [
  'android/build',
  'android/app/build',
  'node_modules/expo/android/build',
  'node_modules/expo-constants/android/build',
  'node_modules/expo-modules-core/android/build',
  'node_modules/expo-modules-core/android/.cxx',
  'node_modules/react-native-gesture-handler/android/build',
  'node_modules/react-native-gesture-handler/android/.cxx',
  'node_modules/react-native-reanimated/android/build',
  'node_modules/react-native-reanimated/android/.cxx',
  'node_modules/react-native-safe-area-context/android/build',
  'node_modules/react-native-screens/android/build',
  'node_modules/react-native-screens/android/.cxx',
  'node_modules/react-native-svg/android/build',
  'node_modules/react-native-worklets/android/build',
  'node_modules/react-native-worklets/android/.cxx',
];

for (const relativeDir of buildDirs) {
  const fullPath = path.join(projectRoot, relativeDir);
  fs.rmSync(fullPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

const expoCli = path.join(projectRoot, 'node_modules', 'expo', 'bin', 'cli');
const args = [expoCli, 'run:android', '--no-build-cache', ...process.argv.slice(2)];

const env = { ...process.env };
if (!env.NODE_ENV) {
  env.NODE_ENV = 'development';
}

const result = spawnSync(process.execPath, args, {
  cwd: projectRoot,
  stdio: 'inherit',
  env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
