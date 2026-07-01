export function formatNumber(value: number, digits = 2): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export function truncateHotkey(hotkey: string): string {
  if (hotkey.length <= 18) return hotkey;
  return `${hotkey.slice(0, 10)}…${hotkey.slice(-6)}`;
}
