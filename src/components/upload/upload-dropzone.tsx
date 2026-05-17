"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFile: (file: File) => void;
  onSample: () => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFile, onSample, disabled }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file?.type === "application/pdf") onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "relative flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition-all",
        dragOver
          ? "border-teal-400/50 bg-teal-500/5"
          : "border-white/[0.12] bg-card/30 hover:border-white/20",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <motion.div
        animate={{ scale: dragOver ? 1.05 : 1 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 ring-1 ring-teal-500/20"
      >
        <Upload className="h-6 w-6 text-teal-400" />
      </motion.div>

      <h3 className="mt-4 text-lg font-medium">Drop your lab report PDF</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        LifeLabs, Dynacare, and similar semi-structured blood panels. We extract biomarkers,
        normalize units, and detect flags.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-teal-500/20 px-4 py-2 text-sm font-medium text-teal-300 ring-1 ring-teal-500/30 transition hover:bg-teal-500/30"
        >
          Choose PDF
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onSample}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
        >
          <FileText className="h-4 w-4" />
          Load sample report
        </button>
      </div>
    </div>
  );
}
