export type Optional<T> = T | null | undefined;
export type Nullable<T> = T | null;

export interface DynamicRouteParams<T = unknown> {
  params: Promise<T>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}
