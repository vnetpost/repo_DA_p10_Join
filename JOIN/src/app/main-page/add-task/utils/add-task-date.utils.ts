/**
 * Parses a due-date string from either `YYYY/MM/DD` or `YYYY-MM-DD`.
 *
 * @param value Date string entered in the add-task form.
 * @returns Parsed date or `null` when the value is invalid.
 */
export function parseAddTaskDueDate(value: string): Date | null {
  const parts = value.split(/[\/-]/);
  if (parts.length !== 3) return null;
  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}
