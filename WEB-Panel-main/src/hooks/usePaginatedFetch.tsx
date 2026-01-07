'use client';
import { PaginatedResult } from '@/types/pagination';
import { useCallback, useRef, useState } from 'react';

function usePaginatedFetch<T>({
  fetchFunction,
}: {
  fetchFunction: (
    cursor: string | null | undefined,
  ) => Promise<PaginatedResult<T> | null | undefined>;
}) {
  const [items, setItems] = useState<T[]>([]);
  const cursor = useRef<string | null | undefined>(undefined);
  const isFetching = useRef(false);

  const fetchNext = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const batch = await fetchFunction(cursor.current);
      if (batch) {
        setItems((prev) => [...prev, ...(batch?.items || [])]);
      }
      cursor.current = batch?.cursor ?? null;
    } finally {
      isFetching.current = false;
    }
  }, [fetchFunction]);

  const reset = () => {
    setItems([]);
    cursor.current = undefined;
  };

  const updateItem = (updatedItem: T, keyFn: (item: T) => string) => {
    setItems((prevItems) =>
      prevItems.map((item) => (keyFn(item) === keyFn(updatedItem) ? updatedItem : item)),
    );
  };

  const removeItem = (itemToRemove: T, keyFn: (item: T) => string) => {
    setItems((prevItems) => prevItems.filter((item) => keyFn(item) !== keyFn(itemToRemove)));
  };

  return {
    items,
    fetchNext,
    reset,
    updateItem,
    removeItem,
    isAllFetched: cursor.current === null,
  };
}

export default usePaginatedFetch;
