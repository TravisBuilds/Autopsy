"use client";

import { groupTextItemsIntoLines } from "@/lib/ingestion/extract-pdf-lines";

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

export { groupTextItemsIntoLines } from "@/lib/ingestion/extract-pdf-lines";
