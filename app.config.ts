import dotenv from 'dotenv';
import { ConfigContext } from 'expo/config';
import { ExpoConfig } from '@expo/config-types';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const readEnv = (key: string) => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

export default (_context: ConfigContext): ExpoConfig => {
  const appName = readEnv('EXPO_PUBLIC_APP_NAME') ?? 'Closing Engage';
  const apiUrl = readEnv('EXPO_PUBLIC_API_URL');
  const environment = readEnv('EXPO_PUBLIC_ENV') ?? 'development';
  const easProjectId = readEnv('EXPO_PUBLIC_EAS_PROJECT_ID') ?? 'a646fa7f-28aa-4974-8d2d-69b7eb09fcce';

  const config = {
    name: appName,
    slug: 'closing-engage-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'closingengage',
    userInterfaceStyle: 'light',
    icon: './assets/icon.png',
    splash: {
      image: './assets/app-icon-512px.png',
      resizeMode: 'contain',
      backgroundColor: '#f4f8ff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.closingengage.app',
      infoPlist: {
        NSPhotoLibraryUsageDescription: 'Allow access to your photo library so you can upload profile images and documents.',
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.closingengage.app',
      permissions: [
        'android.permission.INTERNET',
        'android.permission.VIBRATE',
        'android.permission.POST_NOTIFICATIONS',
      ],
      blockedPermissions: [
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.RECORD_AUDIO',
        'android.permission.SYSTEM_ALERT_WINDOW',
      ],
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#f4f8ff',
      },
      predictiveBackGestureEnabled: false,
    },
    plugins: ['expo-router', 'expo-secure-store', 'expo-document-picker', 'expo-image-picker', 'expo-font', 'expo-notifications'],
    extra: {
      apiUrl,
      environment,
      eas: {
        projectId: easProjectId,
      },
    },
  } as ExpoConfig & { newArchEnabled?: boolean };

  return config;
};
