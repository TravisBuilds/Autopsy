"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ParseProgress } from "@/components/upload/parse-progress";
import { ParseReview } from "@/components/upload/parse-review";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { Button } from "@/components/ui/button";
import { extractPdfText } from "@/lib/ingestion/extract-pdf-text";
import { parseLabReportText } from "@/lib/ingestion/parse-lab-report";
import { SAMPLE_LAB_REPORT } from "@/lib/ingestion/sample-report";
import { useHealthStore } from "@/stores/health-store";
import type { LabParseResult, UploadStep } from "@/types/ingestion";

export function UploadWorkflow() {
  const router = useRouter();
  const confirmSession = useHealthStore((s) => s.confirmSession);

  const [step, setStep] = useState<UploadStep>("idle");
  const [parseResult, setParseResult] = useState<LabParseResult | null>(null);
  const [fileName, setFileName] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const runParse = useCallback(async (text: string, name?: string) => {
    setError(null);
    setFileName(name);
    setStep("parsing");

    await new Promise((r) => setTimeout(r, 400));

    const result = parseLabReportText(text);
    setParseResult(result);
    setStep("review");
  }, []);

  const handlePdf = useCallback(
    async (file: File) => {
      setError(null);
      setStep("extracting");

      try {
        const text = await extractPdfText(file);
        if (!text.trim()) {
          throw new Error("No text found in PDF. The file may be scanned — OCR is not yet supported.");
        }
        await runParse(text, file.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to read PDF");
        setStep("idle");
      }
    },
    [runParse]
  );

  const handleSample = useCallback(async () => {
    setStep("extracting");
    await new Promise((r) => setTimeout(r, 600));
    await runParse(SAMPLE_LAB_REPORT, "sample-lifelabs-report.txt");
  }, [runParse]);

  const handleConfirm = useCallback(
    async (sessionDate: string) => {
      if (!parseResult) return;
      setStep("saving");
      await new Promise((r) => setTimeout(r, 300));

      confirmSession({
        biomarkers: parseResult.biomarkers,
        sessionDate,
        labName: parseResult.labName ?? undefined,
        sourceFileName: fileName,
      });

      setStep("complete");
    },
    [parseResult, fileName, confirmSession]
  );

  const reset = () => {
    setStep("idle");
    setParseResult(null);
    setFileName(undefined);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <UploadDropzone onFile={handlePdf} onSample={handleSample} />
            {error && (
              <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}
          </motion.div>
        )}

        {(step === "extracting" || step === "parsing") && (
          <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ParseProgress
              step={step}
              detectedCategories={parseResult?.categories}
            />
          </motion.div>
        )}

        {step === "review" && parseResult && (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ParseReview
              result={parseResult}
              fileName={fileName}
              onConfirm={handleConfirm}
              onCancel={reset}
            />
          </motion.div>
        )}

        {step === "saving" && (
          <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ParseProgress step="parsing" detectedCategories={parseResult?.categories} />
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
            <h3 className="mt-4 text-lg font-medium">Timeline updated</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {parseResult?.biomarkers.length} biomarkers saved. Your dashboards now reflect this panel.
            </p>
            <div className="mt-8 flex gap-3">
              <Button variant="outline" onClick={reset}>
                Upload another
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
        <p className="text-center text-xs text-muted-foreground">
          Data is stored locally in your browser until Supabase sync (Phase 6).{" "}
          <Link href="/biomarkers" className="text-teal-400 hover:underline">
            View current biomarkers →
          </Link>
        </p>
      )}
    </div>
  );
}
