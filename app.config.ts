import dotenv from 'dotenv';
import { ExpoConfig } from 'expo/config';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const readEnv = (key: string) => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const easProjectId = readEnv('EXPO_PUBLIC_EAS_PROJECT_ID') ?? 'a646fa7f-28aa-4974-8d2d-69b7eb09fcce';

const config: ExpoConfig = {
  name: readEnv('EXPO_PUBLIC_APP_NAME') ?? 'Closing Engage',
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
  plugins: ['expo-router', 'expo-secure-store', 'expo-document-picker', 'expo-image-picker', 'expo-font'],
  extra: {
    apiUrl: readEnv('EXPO_PUBLIC_API_URL') ?? 'https://api.closingengage.example',
    environment: readEnv('EXPO_PUBLIC_ENV') ?? 'development',
    eas: {
      projectId: easProjectId,
    },
  },
};

export default config;
