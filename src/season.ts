/**
 * Checks whether a date falls on Halloween in local time.
 * @param date - The date to check.
 * @returns Whether the date is October 31.
 */
export function isHalloween(date: Date): boolean {
  return date.getMonth() === 9 && date.getDate() === 31;
}
