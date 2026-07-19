import { Platform } from 'react-native';

const storage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  }
};

export async function isAvailableAsync(): Promise<boolean> {
  return true;
}

export async function getItemAsync(key: string, _options?: any): Promise<string | null> {
  try {
    return storage.getItem(key);
  } catch (error) {
    console.warn(`[SecureStore Mock] Error getting key "${key}":`, error);
    return null;
  }
}

export async function setItemAsync(key: string, value: string, _options?: any): Promise<void> {
  try {
    storage.setItem(key, value);
  } catch (error) {
    console.warn(`[SecureStore Mock] Error setting key "${key}":`, error);
  }
}

export async function deleteItemAsync(key: string, _options?: any): Promise<void> {
  try {
    storage.removeItem(key);
  } catch (error) {
    console.warn(`[SecureStore Mock] Error deleting key "${key}":`, error);
  }
}
