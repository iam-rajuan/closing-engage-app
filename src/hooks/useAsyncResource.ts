import { DependencyList, useCallback, useEffect, useMemo, useState } from 'react';
import { Dispatch, SetStateAction } from 'react';

type ResourceCacheEntry<T> = {
  data: T;
  updatedAt: number;
};

type UseAsyncResourceOptions = {
  cacheKey?: string;
  ttlMs?: number;
};

const resourceCache = new Map<string, ResourceCacheEntry<unknown>>();

const DEFAULT_TTL_MS = 2 * 60 * 1000;

const getCachedEntry = <T>(cacheKey?: string) => {
  if (!cacheKey) return null;
  return (resourceCache.get(cacheKey) as ResourceCacheEntry<T> | undefined) ?? null;
};

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  deps: DependencyList,
  options: UseAsyncResourceOptions = {},
) {
  const { cacheKey, ttlMs = DEFAULT_TTL_MS } = options;
  const initialCache = useMemo(() => getCachedEntry<T>(cacheKey), [cacheKey]);
  const [data, setDataState] = useState<T | null>(initialCache?.data ?? null);
  const [loading, setLoading] = useState(!initialCache);
  const [error, setError] = useState<string | null>(null);

  const setData: Dispatch<SetStateAction<T | null>> = useCallback((value) => {
    setDataState((current) => {
      const nextValue = typeof value === 'function' ? (value as (prev: T | null) => T | null)(current) : value;
      if (cacheKey && nextValue !== null) {
        resourceCache.set(cacheKey, { data: nextValue, updatedAt: Date.now() });
      }
      return nextValue;
    });
  }, [cacheKey]);

  const reload = useCallback(async (showSpinner = true) => {
    if (showSpinner) {
      setLoading(true);
    }
    setError(null);
    try {
      const result = await loader();
      setData(result);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to load data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setData, ...deps]);

  useEffect(() => {
    const cachedEntry = getCachedEntry<T>(cacheKey);
    const isFresh = cachedEntry ? Date.now() - cachedEntry.updatedAt < ttlMs : false;

    if (cachedEntry) {
      setDataState(cachedEntry.data);
      setLoading(false);
      if (!isFresh) {
        void reload(false);
      }
      return;
    }

    void reload();
  }, [cacheKey, reload, ttlMs]);

  return {
    data,
    loading,
    error,
    reload,
    setData,
  };
}
