-- Genome imports and interpreted variants (pre-processed JSON from external WGS pipeline)

create table public.genome_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_file_name text,
  variant_count integer not null default 0,
  interpretation_version text not null,
  last_interpreted_at date,
  created_at timestamptz not null default now()
);

create index genome_imports_user_id_idx on public.genome_imports (user_id, created_at desc);

alter table public.genome_imports enable row level security;

create policy "Users can read own genome imports"
  on public.genome_imports for select
  using (auth.uid() = user_id);

create policy "Users can insert own genome imports"
  on public.genome_imports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own genome imports"
  on public.genome_imports for delete
  using (auth.uid() = user_id);

create table public.genome_variants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  import_id uuid not null references public.genome_imports (id) on delete cascade,
  gene text not null,
  risk_domain text not null,
  display_name text not null,
  variant_id text not null,
  genotype text not null,
  clinical_significance text not null,
  phenotype text[] not null default '{}',
  display_summary text not null,
  importance_score integer not null check (importance_score >= 0 and importance_score <= 100),
  clinical_confidence text not null check (
    clinical_confidence in ('high', 'moderate', 'low', 'uncertain')
  ),
  linked_biomarkers text[] not null default '{}',
  evidence_source text[] not null default '{}',
  evidence_url text,
  hgvs text,
  last_interpreted_at date,
  knowledge_sources text[] not null default '{}',
  interpretation_version text not null,
  created_at timestamptz not null default now()
);

create index genome_variants_user_id_idx on public.genome_variants (user_id);
create index genome_variants_import_id_idx on public.genome_variants (import_id);
create index genome_variants_gene_idx on public.genome_variants (user_id, gene);
create index genome_variants_importance_idx on public.genome_variants (user_id, importance_score desc);

alter table public.genome_variants enable row level security;

create policy "Users can read own genome variants"
  on public.genome_variants for select
  using (auth.uid() = user_id);

create policy "Users can insert own genome variants"
  on public.genome_variants for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own genome variants"
  on public.genome_variants for delete
  using (auth.uid() = user_id);
