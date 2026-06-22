import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform, Alert } from 'react-native';
import { registerAppNotificationResponseListener } from '@/utils/appNotifications';

const DOWNLOAD_DIR_KEY = 'closing_engage_download_dir_uri';

// Set notification handler to display notifications even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function requestNotificationPermission() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Error requesting notification permission:', error);
    return false;
  }
}

async function triggerDownloadNotification(fileName: string, localUri: string, mimeType: string) {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Downloads',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2167d8',
      });
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Download complete',
        body: `"${fileName}" has been downloaded to your selected folder.`,
        sound: true,
        data: {
          localUri,
          mimeType,
          fileName,
        },
      },
      trigger: {
        channelId: 'default',
      },
    });
  } catch (error) {
    console.error('Failed to trigger notification:', error);
  }
}

async function saveToSAF(directoryUri: string, tempUri: string, fileName: string, mimeType: string) {
  const { StorageAccessFramework } = FileSystem;
  
  // Create file in the designated directory
  const fileUri = await StorageAccessFramework.createFileAsync(
    directoryUri,
    fileName,
    mimeType || 'application/octet-stream'
  );
  
  if (!fileUri) {
    throw new Error('Failed to create file in the selected directory');
  }

  // Read from cached tempUri and write to public fileUri
  const content = await FileSystem.readAsStringAsync(tempUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  // Trigger system notification in the notification bar
  await triggerDownloadNotification(fileName, tempUri, mimeType);
}

export function getMimeType(fileName: string, fallbackMimeType: string = 'application/octet-stream'): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'mp4':
    case 'm4v':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'doc':
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'txt':
      return 'text/plain';
    case 'zip':
      return 'application/zip';
    default:
      return fallbackMimeType;
  }
}

export async function downloadFileToDevice(url: string, fileName: string, mimeType: string): Promise<{ localUri: string; mimeType: string }> {
  try {
    const resolvedMime = getMimeType(fileName, mimeType || 'application/octet-stream');
    const cleanName = encodeURIComponent(fileName.replace(/\s+/g, '_'));
    const tempUri = FileSystem.cacheDirectory + cleanName;
    
    // 1. Download to local cache directory first
    const downloadResult = await FileSystem.downloadAsync(url, tempUri);
    if (downloadResult.status !== 200) {
      throw new Error('Server returned status ' + downloadResult.status);
    }
    
    // 2. Platform-specific saving
    if (Platform.OS === 'ios') {
      // iOS: sandboxed OS, use standard Share sheet (enables "Save to Files")
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: resolvedMime,
          dialogTitle: `Save ${fileName}`,
        });
        await triggerDownloadNotification(fileName, downloadResult.uri, resolvedMime);
      } else {
        throw new Error('Sharing/Saving is not available on this device');
      }
    } else {
      // Android: use Storage Access Framework to write directly to public folder (asks once)
      const { StorageAccessFramework } = FileSystem;
      let directoryUri = await SecureStore.getItemAsync(DOWNLOAD_DIR_KEY);
      
      if (!directoryUri) {
        return new Promise<{ localUri: string; mimeType: string }>((resolve, reject) => {
          Alert.alert(
            'Select Download Folder',
            'Please choose a folder (e.g., Downloads) where the document should be saved. You will only need to select this once.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  try {
                    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
                    if (permissions.granted) {
                      await SecureStore.setItemAsync(DOWNLOAD_DIR_KEY, permissions.directoryUri);
                      await saveToSAF(permissions.directoryUri, downloadResult.uri, fileName, resolvedMime);
                      resolve({ localUri: tempUri, mimeType: resolvedMime });
                    } else {
                      Alert.alert('Permission Denied', 'Unable to save document without a folder selection.');
                      reject(new Error('Permission Denied'));
                    }
                  } catch (err) {
                    console.error('SAF Permission error:', err);
                    Alert.alert('Download failed', 'Could not access the selected directory.');
                    reject(err);
                  }
                }
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => reject(new Error('Download cancelled by user')),
              }
            ]
          );
        });
      } else {
        try {
          await saveToSAF(directoryUri, downloadResult.uri, fileName, resolvedMime);
        } catch (err) {
          console.warn('Cached directory access failed, retrying folder picker:', err);
          // If the cached directoryUri is invalid or revoked, clear it and retry permission flow
          await SecureStore.deleteItemAsync(DOWNLOAD_DIR_KEY);
          
          return new Promise<{ localUri: string; mimeType: string }>((resolve, reject) => {
            StorageAccessFramework.requestDirectoryPermissionsAsync().then(async (permissions) => {
              if (permissions.granted) {
                await SecureStore.setItemAsync(DOWNLOAD_DIR_KEY, permissions.directoryUri);
                await saveToSAF(permissions.directoryUri, downloadResult.uri, fileName, resolvedMime);
                resolve({ localUri: tempUri, mimeType: resolvedMime });
              } else {
                Alert.alert('Permission Denied', 'Unable to save document without a folder selection.');
                reject(new Error('Permission Denied'));
              }
            }).catch(reject);
          });
        }
      }
    }
    return { localUri: tempUri, mimeType: resolvedMime };
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

export async function openDownloadedFile(localUri: string, mimeType: string, fileName: string) {
  try {
    if (Platform.OS === 'android') {
      const contentUri = await FileSystem.getContentUriAsync(localUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // Intent.FLAG_GRANT_READ_URI_PERMISSION
        type: mimeType || 'application/octet-stream',
      });
    } else {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          mimeType: mimeType || 'application/octet-stream',
          dialogTitle: `Open ${fileName}`,
        });
      }
    }
  } catch (error) {
    console.error('Error opening file directly:', error);
    // Fallback to standard sharing if direct intent launch fails
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          mimeType: mimeType || 'application/octet-stream',
          dialogTitle: `Open ${fileName}`,
        });
      }
    } catch (fallbackError) {
      console.error('Sharing fallback failed:', fallbackError);
      Alert.alert('Unable to open file', 'Could not open or view this document format.');
    }
  }
}

export function registerNotificationResponseListener() {
  const appNotificationSubscription = registerAppNotificationResponseListener();
  const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
    const data = response.notification.request.content.data as {
      localUri?: string;
      mimeType?: string;
      fileName?: string;
    };
    if (data && typeof data.localUri === 'string') {
      try {
        const fileInfo = await FileSystem.getInfoAsync(data.localUri);
        if (fileInfo.exists) {
          await openDownloadedFile(data.localUri, data.mimeType || 'application/octet-stream', data.fileName || 'document');
        } else {
          Alert.alert('File not found', 'The cached downloaded file could not be located.');
        }
      } catch (error) {
        console.error('Error opening file from notification response:', error);
      }
    }
  });
  return {
    remove() {
      subscription.remove();
      appNotificationSubscription.remove();
    },
  };
}
