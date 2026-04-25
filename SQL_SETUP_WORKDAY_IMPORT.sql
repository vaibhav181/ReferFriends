-- Workday import support (additive and backward-compatible)

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS external_path TEXT,
ADD COLUMN IF NOT EXISTS apply_url TEXT,
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS posting_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS posting_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS jobs_source_external_id_uidx
ON jobs(source, external_id)
WHERE source IS NOT NULL AND external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS jobs_source_idx ON jobs(source);
CREATE INDEX IF NOT EXISTS jobs_posting_end_date_idx ON jobs(posting_end_date);
CREATE INDEX IF NOT EXISTS jobs_imported_at_idx ON jobs(imported_at DESC);
