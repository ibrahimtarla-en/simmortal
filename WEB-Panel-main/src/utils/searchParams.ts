export function toSearchParams<T>(obj: Partial<T>): string {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // Handle booleans properly
    if (typeof value === 'boolean') {
      params.set(key, value ? 'true' : 'false');
    }
    // Handle objects/arrays by stringifying them
    else if (typeof value === 'object') {
      params.set(key, JSON.stringify(value));
    }
    // Everything else -> convert to string
    else {
      params.set(key, String(value));
    }
  });

  return params.toString();
}
