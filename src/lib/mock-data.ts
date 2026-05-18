import type {
  AIInsight,
  BiomarkerReading,
  HealthAlert,
  Intervention,
  TimelineEvent,
  WearableSnapshot,
} from "@/types/health";

export const mockBiomarkers: BiomarkerReading[] = [
  {
    id: "ldl",
    markerName: "LDL Cholesterol",
    category: "cardiovascular",
    value: 4.31,
    unit: "mmol/L",
    referenceLow: 1.5,
    referenceHigh: 3.4,
    flag: "high",
    date: "2026-03-11",
    changePercent: 45,
    history: [
      { date: "2023-12", value: 2.81 },
      { date: "2024-07", value: 4.06 },
      { date: "2025-05", value: 3.36 },
      { date: "2025-11", value: 2.96 },
      { date: "2026-03", value: 4.31 },
    ],
    insight:
      "LDL has remained elevated across multiple years with worsening in 2026.",
  },
  {
    id: "hscrp",
    markerName: "hsCRP",
    category: "inflammation",
    value: 2.8,
    unit: "mg/L",
    referenceLow: 0,
    referenceHigh: 1.0,
    flag: "high",
    date: "2026-03-11",
    changePercent: 12,
    history: [
      { date: "2024-01", value: 1.2 },
      { date: "2024-07", value: 2.1 },
      { date: "2025-11", value: 2.5 },
      { date: "2026-03", value: 2.8 },
    ],
  },
  {
    id: "ferritin",
    markerName: "Ferritin",
    category: "hematology",
    value: 420,
    unit: "µg/L",
    referenceLow: 30,
    referenceHigh: 300,
    flag: "high",
    date: "2026-03-11",
    changePercent: -18,
    history: [
      { date: "2025-05", value: 510 },
      { date: "2025-08", value: 460 },
      { date: "2026-03", value: 420 },
    ],
    insight: "Ferritin trending down from May 2025 spike.",
  },
  {
    id: "neutrophils",
    markerName: "Neutrophils",
    category: "hematology",
    value: 1.4,
    unit: "×10⁹/L",
    referenceLow: 1.8,
    referenceHigh: 7.5,
    flag: "low",
    date: "2026-03-11",
    history: [
      { date: "2025-11", value: 1.6 },
      { date: "2026-01", value: 1.5 },
      { date: "2026-03", value: 1.4 },
    ],
    insight: "Persistent low neutrophils — monitor trend.",
  },
];

export const mockAlerts: HealthAlert[] = [
  {
    id: "a1",
    title: "LDL elevated",
    description: "4.31 mmol/L — above reference range (1.50–3.40)",
    severity: "warning",
    category: "cardiovascular",
    timestamp: "2026-03-11",
  },
  {
    id: "a2",
    title: "Low neutrophils",
    description: "Persistent downward trend over 4 months",
    severity: "warning",
    category: "hematology",
    timestamp: "2026-03-11",
  },
  {
    id: "a3",
    title: "hsCRP elevated",
    description: "Inflammation marker above optimal range",
    severity: "info",
    category: "inflammation",
    timestamp: "2026-03-11",
  },
];

const mockInterventionTs = "2025-01-01T00:00:00.000Z";

export const mockInterventions: Intervention[] = [
  {
    id: "i1",
    name: "Magnesium Glycinate",
    type: "supplement",
    dosage: "400mg",
    frequency: "Nightly",
    startDate: "2025-10-01",
    active: true,
    createdAt: mockInterventionTs,
    updatedAt: mockInterventionTs,
  },
  {
    id: "i2",
    name: "Berberine",
    type: "supplement",
    dosage: "500mg",
    frequency: "2× daily with meals",
    startDate: "2026-01-15",
    active: true,
    createdAt: mockInterventionTs,
    updatedAt: mockInterventionTs,
  },
  {
    id: "i3",
    name: "Zone 2 cardio",
    type: "exercise",
    frequency: "4× weekly",
    startDate: "2025-06-01",
    active: true,
    createdAt: mockInterventionTs,
    updatedAt: mockInterventionTs,
  },
];

export const mockWearable: WearableSnapshot = {
  source: "WHOOP",
  recovery: 72,
  hrv: 48,
  restingHr: 52,
  sleepScore: 81,
  strain: 12.4,
  date: "2026-05-16",
};

export const mockInsights: AIInsight[] = [
  {
    id: "ins1",
    title: "Lipid regression in 2026",
    summary:
      "LDL improved through Nov 2025 then reversed sharply. Consider correlating with recent dietary or intervention changes.",
    evidenceLevel: "B",
    relatedMarkers: ["LDL Cholesterol", "Triglycerides"],
  },
  {
    id: "ins2",
    title: "Recovery–HRV correlation",
    summary:
      "HRV has trended up ~12% since magnesium protocol started in Oct 2025. Correlation ≠ causation.",
    evidenceLevel: "C",
    relatedMarkers: ["HRV"],
  },
];

export const mockTimeline: TimelineEvent[] = [
  {
    id: "t1",
    date: "2023-12",
    label: "Dec 2023 panel",
    type: "biomarker",
    direction: "up",
    markers: ["Cholesterol", "Urate"],
  },
  {
    id: "t2",
    date: "2024-07",
    label: "Jul 2024 panel",
    type: "biomarker",
    direction: "up",
    markers: ["LDL spike", "Triglycerides", "hsCRP", "B12 ↓"],
  },
  {
    id: "t3",
    date: "2025-05",
    label: "May 2025 panel",
    type: "biomarker",
    direction: "up",
    markers: ["Ferritin spike", "Urate spike"],
  },
  {
    id: "t4",
    date: "2025-10",
    label: "Magnesium started",
    type: "intervention",
    direction: "neutral",
  },
  {
    id: "t5",
    date: "2025-11",
    label: "Nov 2025 panel",
    type: "biomarker",
    direction: "down",
    markers: ["Lipids improved", "WBC trend begins"],
  },
  {
    id: "t6",
    date: "2026-03",
    label: "Mar 2026 panel",
    type: "biomarker",
    direction: "up",
    markers: ["LDL worsened", "TG elevated", "Low neutrophils"],
  },
];
