import { ValueTransformer } from 'typeorm';

/**
 * Transform integer to a number or null
 */
export const transformInt: ValueTransformer = {
  from: (value: string | null | undefined) =>
    value !== null && value !== undefined ? parseInt(value) : value,
  to: (value: number | null | undefined) => value,
};

/**
 * Transform float to a number or null
 */
export const transformFloat: ValueTransformer = {
  from: (value: string | null | undefined) =>
    value !== null && value !== undefined ? parseFloat(value) : value,
  to: (value: number | null | undefined) => value,
};

export const nullToUndefinedTransformer: ValueTransformer = {
  to: (value: unknown) => (value === undefined ? null : value), // Store undefined as null in DB
  from: (value: unknown) => (value === null ? undefined : value), // Return null as undefined from DB
};

export function toBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === '1';
  }
  return Boolean(value);
}
