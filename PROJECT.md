# Autopsy

Personal longitudinal health intelligence platform.

> A futuristic biological operating system for tracking biomarkers, imaging, genetics, interventions, wearable data, and longitudinal health intelligence over time.

## Build status

### Phase 1 — complete

- [x] Next.js App Router + TypeScript + Tailwind v4 + shadcn/ui
- [x] Framer Motion, Recharts, Zustand-ready stack
- [x] Dark-first premium theme (`src/app/globals.css`)
- [x] App shell, sidebar, top bar (`src/components/layout/`)
- [x] Reusable health cards (`src/components/cards/`)
- [x] Home command center dashboard (`src/app/(app)/page.tsx`)
- [x] Route stubs: biomarkers, timeline, interventions, wearables, genome, imaging, upload
- [x] Mock longitudinal data aligned with spec (`src/lib/mock-data.ts`)

### Phase 2 — complete

- [x] PDF text extraction (client-side `pdfjs-dist`)
- [x] LifeLabs-style row parser + marker catalog + unit normalization
- [x] Upload workflow: dropzone → parse animation → review table → confirm
- [x] Zustand store with localStorage persist (`src/stores/health-store.ts`)
- [x] Dashboards wired to uploaded data (biomarkers, alerts, timeline)
- [x] Sample report loader for testing without a PDF

### Phase 3 — complete

- [x] Longitudinal `BiomarkerChart` with reference range band + tooltips
- [x] Trend classification (improving / worsening / stable / volatile)
- [x] Biomarker dashboard with category filters + summary stats
- [x] Detail side panel with full chart + history table
- [x] Trend badges on biomarker cards (home + biomarkers pages)
- [x] Batch multi-PDF upload, session-based panel archive, priority Command Center
- [x] Biomarker descriptions (cards + detail sheet)

### Phase 4 — in progress

- [x] Interactive timeline axis with clickable lab panels (`/timeline`)
- [x] Panel drill-down: flagged markers, click → biomarker detail sheet
- [x] Home timeline preview links to `/timeline?panel=…`
- [x] Interventions CRUD (medications, supplements, dosage, start month)
- [x] Intervention markers on timeline (violet dots)
- [x] Auth sessions + WHOOP OAuth routes (`/login`, `/wearables`, `.env.example`)
- [ ] WHOOP data sync + recovery on timeline
- [ ] Multi-marker overlay chart on shared axis

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Recommended build order

| Phase | Focus |
|-------|--------|
| **1** ✅ | App shell, theme, sidebar, cards, home dashboard |
| **2** ✅ | Upload pipeline, PDF parsing, biomarker normalization |
| **3** ✅ | Biomarker charts, trend classification, range viz |
| **4** 🚧 | Interactive timeline (done), intervention overlays, WHOOP |
| **5** | AI parsing, insight cards, anomaly summaries |
| **6** | Supabase schema, genome & imaging dashboards, correlations |

## Tech stack

- **Frontend:** Next.js, TypeScript, Tailwind, shadcn/ui, Framer Motion, Recharts
- **Backend (planned):** Supabase (Postgres, Storage, Auth, Edge Functions)
- **AI (planned):** OpenAI for PDF parsing & structured summaries

## Key directories

```
src/
  app/(app)/          # Dashboard routes
  components/
    cards/            # BiomarkerCard, AlertCard, etc.
    charts/           # Sparkline
    dashboard/        # SectionHeader, TimelinePreview
    layout/           # AppShell, Sidebar, TopBar
  lib/
    ingestion/        # PDF extract, parse, normalize, marker catalog
    mock-data.ts      # Demo data (until first upload)
    navigation.ts     # Sidebar nav config
  stores/
    health-store.ts   # Persisted biomarkers + sessions
  components/upload/  # Dropzone, progress, review workflow
  types/health.ts     # Core TypeScript models
```

## Product principles

- Longitudinal tracking over static records
- Structured data; correlation ≠ causation
- AI as embedded insights, not diagnosis
- Real-world lab PDF ingestion (LifeLabs-style) in Phase 2

## Example biomarker parse target

Input: `LDL Cholesterol 4.31 A 1.50-3.40 mmol/L`

```json
{
  "marker_name": "LDL Cholesterol",
  "value": 4.31,
  "unit": "mmol/L",
  "reference_low": 1.50,
  "reference_high": 3.40,
  "flag": "high",
  "category": "lipids"
}
```

---

Full product specification was provided at project kickoff. Extend this file or add `docs/` as phases ship.
