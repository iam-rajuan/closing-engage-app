import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: process.env.EXPO_PUBLIC_APP_NAME ?? 'Closing Engage',
  slug: 'closing-engage-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'closingengage',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#f4f8ff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.closingengage.mobile',
  },
  android: {
    package: 'com.closingengage.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#f4f8ff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  plugins: ['expo-router', 'expo-secure-store', 'expo-document-picker', 'expo-image-picker'],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.closingengage.example',
    environment: process.env.EXPO_PUBLIC_ENV ?? 'development',
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? undefined,
    },
  },
};

export default config;
