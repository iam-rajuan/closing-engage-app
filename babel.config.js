module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
            '@app': './app',
            'expo-secure-store': './src/utils/secureStoreWebMock.ts',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
