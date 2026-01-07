import { isMemoryWithAsset, isMemoryWithoutAsset, Memory } from '@/types/memory';
import { useMemo } from 'react';

export function useMemoryAsset(initialValues: Memory | undefined) {
  const withAsset = useMemo(() => {
    if (initialValues && isMemoryWithAsset(initialValues)) {
      return initialValues;
    }
    return undefined;
  }, [initialValues]);

  const withoutAsset = useMemo(() => {
    if (initialValues && isMemoryWithoutAsset(initialValues)) {
      return initialValues;
    }
    return undefined;
  }, [initialValues]);

  const hasAsset = useMemo(() => {
    if (!initialValues) return false;
    return isMemoryWithAsset(initialValues);
  }, [initialValues]);

  return {
    withAsset,
    withoutAsset,
    hasAsset,
  };
}
