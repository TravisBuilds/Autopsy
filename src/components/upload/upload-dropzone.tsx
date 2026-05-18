"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

function pdfFilesFromList(files: FileList | null): File[] {
  if (!files?.length) return [];
  return Array.from(files).filter(
    (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
  );
}

export function UploadDropzone({ onFiles, disabled }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      const pdfs = pdfFilesFromList(fileList);
      if (pdfs.length > 0) onFiles(pdfs);
    },
    [onFiles]
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
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <motion.div
        animate={{ scale: dragOver ? 1.05 : 1 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 ring-1 ring-teal-500/20"
      >
        <Upload className="h-6 w-6 text-teal-400" />
      </motion.div>

      <h3 className="mt-4 text-lg font-medium">Drop lab report PDFs</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Select or drop multiple LifeLabs / Dynacare panels at once. Each file becomes one entry
        in your panel history.
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-6 rounded-lg bg-teal-500/20 px-4 py-2 text-sm font-medium text-teal-300 ring-1 ring-teal-500/30 transition hover:bg-teal-500/30"
      >
        Choose PDFs
      </button>
    </div>
  );
}
