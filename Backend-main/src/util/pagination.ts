import { Cursor } from 'src/types/pagination';

export function encodeCursor<T>(config: Cursor<T>): string {
  return Buffer.from(JSON.stringify(config)).toString('base64');
}

export function parseCursor<T = Record<string, any>>(cursor: string): Cursor<T> | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    return JSON.parse(decoded) as Cursor<T>;
  } catch {
    return null;
  }
}

export function createTypedCursor<T extends Record<string, any>>(
  entity: T,
  sortField: keyof T,
): Cursor<T> {
  return {
    sortField,
    sortValue: entity[sortField],
    id: entity.id as string, // Assumes entities have string IDs
  };
}
