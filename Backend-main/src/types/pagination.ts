export interface Cursor<T = Record<string, any>> {
  sortField: keyof T;
  sortValue: T[keyof T];
  id: string;
}

export interface PaginatedResult<T> {
  items: T[];
  cursor?: string;
}
