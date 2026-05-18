"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { BatchProgress } from "@/components/upload/batch-progress";
import { BatchUploadReview } from "@/components/upload/batch-upload-review";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { Button } from "@/components/ui/button";
import { extractPdfText } from "@/lib/ingestion/extract-pdf-text";
import { parseLabReportText } from "@/lib/ingestion/parse-lab-report";
import { useHealthStore } from "@/stores/health-store";
import type { LabParseResult, PendingUpload, UploadStep } from "@/types/ingestion";

const emptyResult = (): LabParseResult => ({
  biomarkers: [],
  sessionDate: null,
  labName: null,
  categories: [],
  rawLineCount: 0,
  parseErrors: ["No biomarkers detected"],
});

export function UploadWorkflow() {
  const router = useRouter();
  const confirmSession = useHealthStore((s) => s.confirmSession);
  const clearAllData = useHealthStore((s) => s.clearAllData);

  const [step, setStep] = useState<UploadStep>("idle");
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, fileName: "" });
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) {
      setError("No PDF files selected.");
      return;
    }

    setError(null);
    setStep("processing");
    const results: PendingUpload[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setBatchProgress({ current: i + 1, total: files.length, fileName: file.name });

      try {
        const text = await extractPdfText(file);
        if (!text.trim()) {
          results.push({
            id: crypto.randomUUID(),
            fileName: file.name,
            result: emptyResult(),
            sessionDate: new Date().toISOString().slice(0, 10),
            error: "No text in PDF (scanned PDFs need OCR)",
          });
          continue;
        }

        const result = parseLabReportText(text);
        const sessionDate =
          result.sessionDate ?? new Date().toISOString().slice(0, 10);

        results.push({
          id: crypto.randomUUID(),
          fileName: file.name,
          result,
          sessionDate,
          error:
            result.biomarkers.length === 0
              ? result.parseErrors[0] ?? "No markers detected"
              : undefined,
        });
      } catch (err) {
        results.push({
          id: crypto.randomUUID(),
          fileName: file.name,
          result: emptyResult(),
          sessionDate: new Date().toISOString().slice(0, 10),
          error: err instanceof Error ? err.message : "Failed to read PDF",
        });
      }
    }

    setPending(results);
    setStep("batch-review");
  }, []);

  const handleConfirmAll = useCallback(async () => {
    const importable = pending.filter((p) => !p.error && p.result.biomarkers.length > 0);
    if (importable.length === 0) return;

    setStep("saving");
    let count = 0;

    for (const item of importable) {
      confirmSession({
        biomarkers: item.result.biomarkers,
        sessionDate: item.sessionDate,
        labName: item.result.labName ?? undefined,
        sourceFileName: item.fileName,
      });
      count++;
    }

    setImportedCount(count);
    setStep("complete");
  }, [pending, confirmSession]);

  const reset = () => {
    setStep("idle");
    setPending([]);
    setError(null);
    setImportedCount(0);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <UploadDropzone onFiles={processFiles} />
            {error && (
              <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BatchProgress
              current={batchProgress.current}
              total={batchProgress.total}
              fileName={batchProgress.fileName}
            />
          </motion.div>
        )}

        {step === "batch-review" && pending.length > 0 && (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BatchUploadReview
              items={pending}
              onUpdateDate={(id, date) =>
                setPending((prev) =>
                  prev.map((p) => (p.id === id ? { ...p, sessionDate: date } : p))
                )
              }
              onRemove={(id) => setPending((prev) => prev.filter((p) => p.id !== id))}
              onConfirmAll={handleConfirmAll}
              onCancel={reset}
            />
          </motion.div>
        )}

        {step === "saving" && (
          <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BatchProgress
              current={batchProgress.total}
              total={batchProgress.total}
              fileName="Saving to your archive…"
            />
          </motion.div>
        )}

        {step === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center rounded-2xl border border-teal-500/20 bg-teal-500/5 p-12 text-center"
          >
            <CheckCircle2 className="h-12 w-12 text-teal-400" />
            <h3 className="mt-4 text-lg font-medium">
              {importedCount} panel{importedCount !== 1 ? "s" : ""} imported
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Your panel history and biomarker charts are updated.
            </p>
            <div className="mt-8 flex gap-3">
              <Button variant="outline" onClick={reset}>
                Upload more
              </Button>
              <Button
                className="bg-teal-600 text-white hover:bg-teal-500"
                onClick={() => router.push("/biomarkers")}
              >
                View biomarkers
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step === "idle" && (
        <div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
          <p>Data is stored locally in your browser.</p>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Clear all uploaded panels and biomarker data? This cannot be undone."
                )
              ) {
                clearAllData();
              }
            }}
            className="text-teal-400/80 hover:text-teal-400 hover:underline"
          >
            Clear all uploaded data
          </button>
        </div>
      )}
    </div>
  );
}
