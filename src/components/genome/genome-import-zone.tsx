"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { HealthCard } from "@/components/cards/health-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GenomeImportZoneProps {
  compact?: boolean;
  uploading: boolean;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFiles: (files: File[]) => void;
}

function jsonFilesFromList(files: FileList | null): File[] {
  if (!files?.length) return [];
  return Array.from(files).filter(
    (file) =>
      file.type === "application/json" ||
      file.name.toLowerCase().endsWith(".json")
  );
}

export function GenomeImportZone({
  compact = false,
  uploading,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFiles,
}: GenomeImportZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <HealthCard>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition-all",
          compact ? "min-h-[160px]" : "min-h-[220px]",
          dragOver
            ? "border-teal-400/50 bg-teal-500/5"
            : "border-white/[0.12] bg-card/30 hover:border-white/20",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            onFiles(jsonFilesFromList(e.target.files));
            e.target.value = "";
          }}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 ring-1 ring-teal-500/20">
          <Upload className="h-5 w-5 text-teal-400" />
        </div>

        <h3 className="mt-4 text-lg font-medium">
          {compact ? "Replace genome import" : "Import genome JSON"}
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {compact
            ? "Upload a new JSON file to replace your current genome profile."
            : "Drop a Pulse Check genome ingestion file to get started."}
        </p>

        <Button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-6 bg-teal-600 text-white hover:bg-teal-500"
        >
          {uploading ? "Importing…" : "Choose JSON file"}
        </Button>
      </div>
    </HealthCard>
  );
}
