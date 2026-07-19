import dotenv from 'dotenv';
import { ConfigContext, ExpoConfig } from 'expo/config';

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

  return {
    name: appName,
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
      bundleIdentifier: 'com.closingengage.app',
      infoPlist: {
        NSPhotoLibraryUsageDescription: 'Allow access to your photo library so you can upload profile images and documents.',
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
        foregroundImage: './assets/adaptive-icon.png',
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
  };
};
