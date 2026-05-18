"use client";

/**
 * Extract plain text from a PDF, preserving row structure via Y-position grouping.
 * LifeLabs/OSCAR reports break if items are joined with spaces only.
 */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(groupTextItemsIntoLines(content.items));
  }

  return pages.join("\n");
}

interface TextItem {
  str: string;
  transform: number[];
}

function groupTextItemsIntoLines(items: unknown[]): string {
  const rows = new Map<number, { x: number; str: string }[]>();

  for (const item of items) {
    if (!item || typeof item !== "object" || !("str" in item)) continue;
    const t = item as TextItem;
    const text = t.str?.trim();
    if (!text) continue;

    const y = Math.round(t.transform[5]);
    const x = t.transform[4];
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y)!.push({ x, str: text });
  }

  const sortedYs = [...rows.keys()].sort((a, b) => b - a);
  return sortedYs
    .map((y) => {
      const parts = rows.get(y)!.sort((a, b) => a.x - b.x);
      return parts.map((p) => p.str).join("  ");
    })
    .join("\n");
}
