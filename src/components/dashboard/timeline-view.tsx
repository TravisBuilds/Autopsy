"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BiomarkerDetailSheet } from "@/components/biomarkers/biomarker-detail-sheet";
import { DataMigrationBanner } from "@/components/dashboard/data-migration-banner";
import {
  InteractiveTimeline,
  type TimelineSelection,
} from "@/components/timeline/interactive-timeline";
import { InterventionDetailCard } from "@/components/timeline/intervention-detail-card";
import { PanelDetailCard } from "@/components/timeline/panel-detail-card";
import { buildTimelineAxisMarkers } from "@/lib/biomarkers/timeline-axis";
import { useHasUploadedData } from "@/hooks/use-health-data";
import { useHealthStore } from "@/stores/health-store";
import type { BiomarkerReading } from "@/types/health";

export function TimelineView() {
  const searchParams = useSearchParams();
  const sessions = useHealthStore((s) => s.testSessions);
  const interventions = useHealthStore((s) => s.interventions);
  const biomarkers = useHealthStore((s) => s.biomarkers);
  const hasUploaded = useHasUploadedData();

  const markers = useMemo(
    () => buildTimelineAxisMarkers(sessions, interventions),
    [sessions, interventions]
  );

  const [selection, setSelection] = useState<TimelineSelection | null>(null);
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerReading | null>(null);

  const panelFromUrl = searchParams.get("panel");
  const interventionFromUrl = searchParams.get("intervention");

  useEffect(() => {
    if (markers.length === 0) {
      setSelection(null);
      return;
    }
    if (panelFromUrl && markers.some((m) => m.kind === "panel" && m.panel.session.id === panelFromUrl)) {
      setSelection({ kind: "panel", sessionId: panelFromUrl });
      return;
    }
    if (
      interventionFromUrl &&
      markers.some((m) => m.kind === "intervention" && m.intervention.id === interventionFromUrl)
    ) {
      setSelection({ kind: "intervention", interventionId: interventionFromUrl });
      return;
    }
    setSelection((prev) => {
      if (prev?.kind === "panel" && markers.some((m) => m.kind === "panel" && m.panel.session.id === prev.sessionId)) {
        return prev;
      }
      if (
        prev?.kind === "intervention" &&
        markers.some((m) => m.kind === "intervention" && m.intervention.id === prev.interventionId)
      ) {
        return prev;
      }
      const last = markers[markers.length - 1];
      if (last.kind === "panel") return { kind: "panel", sessionId: last.panel.session.id };
      return { kind: "intervention", interventionId: last.intervention.id };
    });
  }, [markers, panelFromUrl, interventionFromUrl]);

  const selectedPanel = useMemo(() => {
    if (selection?.kind !== "panel") return null;
    const m = markers.find((x) => x.kind === "panel" && x.panel.session.id === selection.sessionId);
    return m?.kind === "panel" ? m.panel : null;
  }, [markers, selection]);

  const selectedIntervention = useMemo(() => {
    if (selection?.kind !== "intervention") return null;
    return interventions.find((i) => i.id === selection.interventionId) ?? null;
  }, [interventions, selection]);

  const handleSelectMarker = useCallback(
    (markerId: string) => {
      const b = biomarkers[markerId];
      if (b) setSelectedBiomarker(b);
    },
    [biomarkers]
  );

  if (markers.length === 0) {
    return (
      <>
        <DataMigrationBanner />
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
          Your timeline is empty.{" "}
          <Link href="/upload" className="text-teal-400 hover:underline">
            Upload lab PDFs
          </Link>{" "}
          or{" "}
          <Link href="/interventions" className="text-teal-400 hover:underline">
            log an intervention
          </Link>
          .
        </p>
      </>
    );
  }

  return (
    <>
      <DataMigrationBanner />

      <p className="mb-6 text-xs text-muted-foreground">
        {sessions.length} lab panel{sessions.length !== 1 ? "s" : ""}
        {interventions.length > 0 &&
          ` · ${interventions.length} intervention${interventions.length !== 1 ? "s" : ""}`}
        {!hasUploaded && interventions.length > 0 && " · add labs to correlate with protocols"}
      </p>

      <div className="space-y-8 rounded-2xl border border-white/[0.06] bg-card/40 p-6 backdrop-blur-xl sm:p-8">
        <InteractiveTimeline markers={markers} selection={selection} onSelect={setSelection} />

        {selection?.kind === "intervention" ? (
          <InterventionDetailCard intervention={selectedIntervention} />
        ) : (
          <PanelDetailCard panel={selectedPanel} onSelectMarker={handleSelectMarker} />
        )}
      </div>

      <BiomarkerDetailSheet
        biomarker={selectedBiomarker}
        open={selectedBiomarker !== null}
        onOpenChange={(open) => !open && setSelectedBiomarker(null)}
      />
    </>
  );
}
