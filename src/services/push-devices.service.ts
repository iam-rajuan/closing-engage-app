import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { api, unwrap } from '@/services/api';
import { ensureAppNotificationPermission, getNotificationsModule } from '@/utils/appNotifications';

const PUSH_TOKEN_KEY = 'closing_engage_push_token';

const mobilePlatform = Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : null;
const canRegisterOnCurrentRuntime =
  mobilePlatform !== null && (Device.isDevice || (__DEV__ && Platform.OS === 'android'));

const resolveProjectId = () => {
  const expoConfig = Constants.expoConfig as
    | {
        extra?: {
          eas?: {
            projectId?: string;
          };
        };
      }
    | undefined;
  const easConfig = Constants.easConfig as { projectId?: string } | undefined;
  const manifestExtra = (Constants.manifest2 as { extra?: { eas?: { projectId?: string } } } | null | undefined)?.extra;

  return (
    expoConfig?.extra?.eas?.projectId ??
    manifestExtra?.eas?.projectId ??
    easConfig?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
    process.env.EAS_PROJECT_ID ??
    null
  );
};

const storePushToken = async (token: string) => {
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
};

export const getStoredPushToken = async () => SecureStore.getItemAsync(PUSH_TOKEN_KEY);

export async function registerCurrentDevicePushToken() {
  if (!canRegisterOnCurrentRuntime) {
    return null;
  }

  const granted = await ensureAppNotificationPermission();
  if (!granted) {
    return null;
  }

  const projectId = resolveProjectId();
  if (!projectId) {
    if (__DEV__) {
      console.warn('Expo EAS project id is missing; push token registration skipped.');
    }
    return null;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return null;
  }

  const expoPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  const previousPushToken = await getStoredPushToken();

  await unwrap<Record<string, unknown>>(
    api.post('/api/v1/push-devices/register', {
      expoPushToken,
      platform: mobilePlatform,
      deviceName: Device.deviceName ?? undefined,
      deviceModel: Device.modelName ?? undefined,
      appVersion: Constants.expoConfig?.version ?? undefined,
    }),
  );

  if (previousPushToken && previousPushToken !== expoPushToken) {
    try {
      await unwrap<Record<string, never>>(
        api.post('/api/v1/push-devices/unregister', {
          expoPushToken: previousPushToken,
        }),
      );
    } catch {
      // Ignore stale-token cleanup failures; the new token has already been registered.
    }
  }

  await storePushToken(expoPushToken);
  return expoPushToken;
}

export async function unregisterCurrentDevicePushToken() {
  const expoPushToken = await getStoredPushToken();
  if (!expoPushToken) {
    return;
  }

  try {
    await unwrap<Record<string, never>>(
      api.post('/api/v1/push-devices/unregister', {
        expoPushToken,
      }),
    );
  } catch (error) {
    if (__DEV__) {
      console.warn('Push token unregister failed', error);
    }
  } finally {
    await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
  }
}
