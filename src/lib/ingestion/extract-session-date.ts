const MONTH_TO_NUM: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

const DOB_LABEL = /date\s+of\s+birth|\bd\.?o\.?b\.?\b|born\s+on/i;

const LAB_DATE_LABEL =
  /date\s+of\s+service|collection\s*date|collected\s+on|date\s+received|reported\s+on|report\s+date|specimen\s+collected/i;

/** LifeLabs panels are modern; excludes patient DOB (e.g. 1994). */
const MIN_LAB_YEAR = 2000;

export function extractSessionDate(text: string): string | null {
  const body = text.split(/created by|www\.oscar|page \d+ of/i)[0] ?? text;
  const lines = body
    .split(/\r?\n/)
    .map((l) => l.replace(/\s{2,}/g, " ").trim())
    .filter(Boolean);

  const fromRows = modeResultRowDate(body);
  if (fromRows) return fromRows;

  const fromLabels = labeledLabDate(lines);
  if (fromLabels) return fromLabels;

  const fromPlausible = newestPlausibleIso(body);
  if (fromPlausible) return fromPlausible;

  return newestPlausibleDMonY(body);
}

function isPlausibleLabDate(iso: string): boolean {
  const year = parseInt(iso.slice(0, 4), 10);
  if (Number.isNaN(year) || year < MIN_LAB_YEAR) return false;
  return year <= new Date().getFullYear() + 1;
}

function parseDMonYToIso(raw: string): string | null {
  const m = raw.match(/^(\d{1,2})[-\s/]([A-Za-z]{3})[-\s/](\d{4})$/);
  if (!m) return null;
  const mon = MONTH_TO_NUM[m[2].toLowerCase().slice(0, 3)];
  if (!mon) return null;
  const day = m[1].padStart(2, "0");
  return `${m[3]}-${mon}-${day}`;
}

/** LifeLabs Excelleris: Aug 05 2026 */
function parseMonDYToIso(raw: string): string | null {
  const m = raw.match(/^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})$/);
  if (!m) return null;
  const mon = MONTH_TO_NUM[m[1].toLowerCase().slice(0, 3)];
  if (!mon) return null;
  const day = m[2].padStart(2, "0");
  return `${m[3]}-${mon}-${day}`;
}

function parseTokenToIso(token: string): string | null {
  const iso = token.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return iso[0];
  const monFirst = parseMonDYToIso(token.trim());
  if (monFirst) return monFirst;
  return parseDMonYToIso(token);
}

function datesOnLine(line: string): string[] {
  const found: string[] = [];

  for (const m of line.matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)) {
    const iso = parseTokenToIso(m[1]);
    if (iso) found.push(iso);
  }

  for (const m of line.matchAll(/\b(\d{1,2}[-/][A-Za-z]{3}[-/]\d{4})\b/g)) {
    const iso = parseTokenToIso(m[1].replace(/\//g, "-"));
    if (iso) found.push(iso);
  }

  for (const m of line.matchAll(/\b([A-Za-z]{3}\s+\d{1,2}\s+\d{4})\b/g)) {
    const iso = parseTokenToIso(m[1]);
    if (iso) found.push(iso);
  }

  return found;
}

function isDobLine(line: string): boolean {
  return DOB_LABEL.test(line);
}

function modeResultRowDate(body: string): string | null {
  const counts = new Map<string, number>();
  for (const m of body.matchAll(/\b(20\d{2}-\d{2}-\d{2})\s+\d{2}:\d{2}:\d{2}\b/g)) {
    const iso = m[1];
    if (!isPlausibleLabDate(iso)) continue;
    counts.set(iso, (counts.get(iso) ?? 0) + 1);
  }

  let best: string | null = null;
  let bestCount = 0;
  for (const [date, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      best = date;
    }
  }
  return best;
}

function labeledLabDate(lines: string[]): string | null {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isDobLine(line)) continue;
    if (!LAB_DATE_LABEL.test(line)) continue;

    const onLine = datesOnLine(line).filter(isPlausibleLabDate);
    if (onLine.length > 0) return onLine[0];

    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      const next = lines[j];
      if (isDobLine(next)) continue;
      if (LAB_DATE_LABEL.test(next) && !datesOnLine(next).some(isPlausibleLabDate)) continue;

      const nextDates = datesOnLine(next).filter(isPlausibleLabDate);
      if (nextDates.length > 0) return nextDates[0];
    }
  }
  return null;
}

function isNearDobContext(body: string, index: number): boolean {
  const slice = body.slice(Math.max(0, index - 100), index + 30);
  return DOB_LABEL.test(slice);
}

function newestPlausibleIso(body: string): string | null {
  const candidates: string[] = [];
  for (const m of body.matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)) {
    const iso = m[1];
    if (!isPlausibleLabDate(iso)) continue;
    if (isNearDobContext(body, m.index ?? 0)) continue;
    candidates.push(iso);
  }
  if (candidates.length === 0) return null;
  return candidates.sort().at(-1) ?? null;
}

function newestPlausibleDMonY(body: string): string | null {
  const candidates: string[] = [];
  for (const m of body.matchAll(/\b(\d{1,2}[-/][A-Za-z]{3}[-/]\d{4})\b/g)) {
    const iso = parseDMonYToIso(m[1].replace(/\//g, "-"));
    if (!iso || !isPlausibleLabDate(iso)) continue;
    if (isNearDobContext(body, m.index ?? 0)) continue;
    candidates.push(iso);
  }
  for (const m of body.matchAll(/\b([A-Za-z]{3}\s+\d{1,2}\s+\d{4})\b/g)) {
    const iso = parseMonDYToIso(m[1]);
    if (!iso || !isPlausibleLabDate(iso)) continue;
    if (isNearDobContext(body, m.index ?? 0)) continue;
    candidates.push(iso);
  }
  if (candidates.length === 0) return null;
  return candidates.sort().at(-1) ?? null;
}
