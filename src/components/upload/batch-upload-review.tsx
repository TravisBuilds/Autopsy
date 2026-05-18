"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PendingUpload } from "@/types/ingestion";

interface BatchUploadReviewProps {
  items: PendingUpload[];
  onUpdateDate: (id: string, date: string) => void;
  onRemove: (id: string) => void;
  onConfirmAll: () => void;
  onCancel: () => void;
  saving?: boolean;
}

export function BatchUploadReview({
  items,
  onUpdateDate,
  onRemove,
  onConfirmAll,
  onCancel,
  saving,
}: BatchUploadReviewProps) {
  const importable = items.filter((i) => !i.error && i.result.biomarkers.length > 0);
  const failed = items.filter((i) => i.error || i.result.biomarkers.length === 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Review batch</p>
        <p className="mt-1 text-sm">
          {importable.length} ready to import
          {failed.length > 0 && (
            <span className="text-muted-foreground"> · {failed.length} skipped</span>
          )}
        </p>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Set each panel&apos;s collection date from the report (not the PDF print date).
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02] text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Markers</th>
              <th className="px-4 py-3">Panel date</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const ok = !item.error && item.result.biomarkers.length > 0;
              return (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b border-white/[0.04]",
                    !ok && "bg-red-500/5"
                  )}
                >
                  <td className="max-w-[200px] truncate px-4 py-2.5 font-medium">
                    {item.fileName}
                    {item.error && (
                      <p className="mt-0.5 text-[10px] text-red-300">{item.error}</p>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs tabular-nums">
                    {ok ? item.result.biomarkers.length : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    {ok ? (
                      <input
                        type="date"
                        value={item.sessionDate}
                        onChange={(e) => onUpdateDate(item.id, e.target.value)}
                        className="rounded-lg border border-white/10 bg-background/80 px-2 py-1 font-mono text-xs outline-none focus:border-teal-500/50"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="text-muted-foreground transition hover:text-red-400"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={onConfirmAll}
          disabled={saving || importable.length === 0}
          className="bg-teal-600 text-white hover:bg-teal-500"
        >
          {saving
            ? "Importing…"
            : `Import ${importable.length} panel${importable.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}
