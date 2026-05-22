import { useEffect, useState } from 'react';
import { AuthState } from './auth.types';
import { authStore } from './auth.state';

const identity = (state: AuthState) => state;

export function useAuthStore(): AuthState;
export function useAuthStore<T>(selector: (state: AuthState) => T): T;
export function useAuthStore<T>(selector?: (state: AuthState) => T) {
  const select = selector ?? identity;
  const [slice, setSlice] = useState(() => select(authStore.getState()));

  useEffect(() => {
    setSlice(select(authStore.getState()));
    const unsubscribe = authStore.subscribe((state) => {
      setSlice(select(state));
    });
    return unsubscribe;
  }, [select]);

  return slice;
}
