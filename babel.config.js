module.exports = function (api) {
  api.cache(true);

  const isWeb = process.env.EXPO_PLATFORM === 'web' || process.env.EXPO_BUNDLER_PLATFORM === 'web';

  const alias = {
    '@': './src',
    '@app': './app',
  };

  if (isWeb) {
    alias['expo-secure-store'] = './src/utils/secureStoreWebMock.ts';
  }

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias,
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
