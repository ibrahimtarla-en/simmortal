'use client';
import { useBreakpoints } from '@/hooks';
import { cn } from '@/utils/cn';
import React from 'react';

interface MemorialMasonryLayoutProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
}

function MemorialMasonryLayout<T>({
  items,
  renderItem,
  keyExtractor,
  className,
}: MemorialMasonryLayoutProps<T>) {
  const { isAbove } = useBreakpoints();

  // Organize items into columns for masonry layout
  const createColumns = () => {
    let columnCount = 1;
    if (isAbove('md')) {
      columnCount = 2;
    }
    if (isAbove('2xl')) {
      columnCount = 4;
    }

    const columns: { items: T[]; indices: number[] }[] = Array.from(
      { length: columnCount },
      () => ({ items: [], indices: [] }),
    );

    items.forEach((item, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].items.push(item);
      columns[columnIndex].indices.push(index);
    });
    return columns;
  };
  return (
    <div className={className}>
      <div className={cn('md:flex md:gap-6')}>
        {createColumns().map((column, columnIndex) => (
          <div
            key={columnIndex}
            className={cn('flex flex-1 flex-col gap-6', 'md:nth-2:mt-19', '2xl:nth-4:mt-10')}>
            {column.items.map((item, cardIndex) => {
              const originalIndex = column.indices[cardIndex];
              return <div key={keyExtractor(item)}>{renderItem(item, originalIndex)}</div>;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemorialMasonryLayout;
