type ColumnConfig<T> = {
  key: keyof T | string;
  header: string;
  formatter?: (value: unknown, item: T) => string;
};

/**
 * Converts an array of objects to CSV format and triggers a download
 * @param data - Array of objects to export
 * @param filename - Name of the CSV file (without extension)
 * @param columns - Optional array of column configurations. If not provided, all keys from first object are used
 */
export function exportToCSV<T extends object>(
  data: T[],
  filename: string,
  columns?: ColumnConfig<T>[],
) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Determine columns from config or first data object
  const cols: ColumnConfig<T>[] = columns
    ? columns
    : Object.keys(data[0]).map(
        (key): ColumnConfig<T> => ({
          key,
          header: key,
        }),
      );

  // Create CSV header row
  const headers = cols.map((col) => escapeCSVValue(col.header)).join(',');

  // Create CSV data rows
  const rows = data.map((item) => {
    return cols
      .map((col) => {
        const value = getNestedValue(item as Record<string, unknown>, col.key as string);
        const formattedValue = col.formatter ? col.formatter(value, item) : value;
        return escapeCSVValue(formattedValue);
      })
      .join(',');
  });

  // Combine header and rows
  const csv = [headers, ...rows].join('\n');

  // Create blob and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Escapes special characters in CSV values
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, newline, or quotes, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Gets a nested value from an object using dot notation
 * e.g., getNestedValue({ stats: { views: 100 } }, 'stats.views') returns 100
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
