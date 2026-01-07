export function createFormData(object: object) {
  const formData = new FormData();
  Object.entries(object).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }
    if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (typeof value === 'boolean') {
      formData.append(key, value.toString());
    } else {
      formData.append(key, value);
    }
  });
  return formData;
}
