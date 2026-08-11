interface TextItem {
  str: string;
  transform: number[];
}

interface PositionedText {
  x: number;
  y: number;
  str: string;
}

/** LifeLabs Excelleris columns can sit 1–3pt apart on Y — merge before joining. */
const ROW_Y_TOLERANCE = 4;

/**
 * Group PDF text items into lines, preserving column order (left → right).
 * Uses Y-clustering so flag/result cells on adjacent baselines stay on one row.
 */
export function groupTextItemsIntoLines(items: unknown[]): string {
  const positioned: PositionedText[] = [];

  for (const item of items) {
    if (!item || typeof item !== "object" || !("str" in item)) continue;
    const t = item as TextItem;
    const text = t.str?.trim();
    if (!text) continue;

    positioned.push({
      x: t.transform[4],
      y: t.transform[5],
      str: text,
    });
  }

  if (positioned.length === 0) return "";

  const clusters = clusterRowsByY(positioned);

  return clusters
    .map((cluster) =>
      cluster
        .sort((a, b) => a.x - b.x)
        .map((p) => p.str)
        .join("  ")
    )
    .join("\n");
}

function clusterRowsByY(items: PositionedText[]): PositionedText[][] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const clusters: { anchorY: number; items: PositionedText[] }[] = [];

  for (const item of sorted) {
    const match = clusters.find((c) => Math.abs(c.anchorY - item.y) <= ROW_Y_TOLERANCE);
    if (match) {
      match.items.push(item);
    } else {
      clusters.push({ anchorY: item.y, items: [item] });
    }
  }

  return clusters.map((c) => c.items);
}
