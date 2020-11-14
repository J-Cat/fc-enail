export const parseIntDefault = (value: string|undefined, defaultValue: number): number => {
  const parsed = parseInt(value || `${defaultValue}`);
  if (isNaN(parsed)) {
    return defaultValue;
  } else {
    return parsed;
  }
}
