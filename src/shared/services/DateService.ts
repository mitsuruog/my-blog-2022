import dayjs from "dayjs";

/**
 *
 * @param dateString
 * @returns
 */
export function formatDate(dateString: string, format = "YYYY/MM/DD"): string {
  return dayjs(dateString).isValid()
    ? dayjs(dateString).format(format)
    : dateString;
}
