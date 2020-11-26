export const getTimeString = (value: number, displaySeconds = true): string => {
  const h = Math.floor(value / 3600000);
  const m = Math.floor(
    (value - (h * 3600000))
    /
    60000
  );
  const s = Math.floor(
    (value - (h * 3600000) - (m * 60000))
    /
    1000
  );
  return `${h !== 0 ? `${h.toString()}:` : ''}${h === 0 ? m.toString() : m.toString().padStart(2, '0')}${displaySeconds ? `:${s.toString().padStart(2, '0')}` : ''}`;
};
