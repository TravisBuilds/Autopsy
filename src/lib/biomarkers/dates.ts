const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Chart / table axis label */
export function formatChartDate(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split("-");
    return `${MONTHS[parseInt(m, 10) - 1]} ${parseInt(d, 10)} '${y.slice(2)}`;
  }
  if (/^\d{4}-\d{2}$/.test(date)) {
    const [y, m] = date.split("-");
    return `${MONTHS[parseInt(m, 10) - 1]} '${y.slice(2)}`;
  }
  return date;
}

/** Timeline row date column */
export function formatTimelineDate(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split("-");
    return `${MONTHS[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
  }
  if (/^\d{4}-\d{2}$/.test(date)) {
    const [y, m] = date.split("-");
    return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
  }
  return date;
}

export function normalizeSessionDate(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  if (/^\d{4}-\d{2}$/.test(date)) return `${date}-01`;
  return date;
}
