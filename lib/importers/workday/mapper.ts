import { WorkdayImporterConfig } from './config';

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getByPath(obj: unknown, path: string): unknown {
  if (!path) return undefined;
  const segments = path.split('.').map((part) => part.trim()).filter(Boolean);
  let cursor: unknown = obj;
  for (const segment of segments) {
    if (cursor == null || typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
}

function toNullableString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function normalizeJobType(value: string | null): 'full-time' | 'part-time' | 'contract' | 'temporary' {
  const lowered = (value || '').toLowerCase();
  if (lowered.includes('part')) return 'part-time';
  if (lowered.includes('contract')) return 'contract';
  if (lowered.includes('temp')) return 'temporary';
  return 'full-time';
}

function toIsoOrNull(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function resolveStatus(postingEndDate: string | null): 'active' | 'closed' {
  if (!postingEndDate) return 'active';
  const end = new Date(postingEndDate);
  if (Number.isNaN(end.getTime())) return 'active';
  return end.getTime() < Date.now() ? 'closed' : 'active';
}

export interface MappedWorkdayJob {
  created_by: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  status: 'active' | 'closed';
  external_id: string;
  external_path: string;
  apply_url: string;
  source: string;
  posting_start_date: string | null;
  posting_end_date: string | null;
  imported_at: string;
  updated_at: string;
}

export interface MapWorkdayJobsResult {
  mappedJobs: MappedWorkdayJob[];
  skipped: number;
}

export function mapWorkdayJobs(
  rawJobs: Record<string, unknown>[],
  config: WorkdayImporterConfig
): MapWorkdayJobsResult {
  const mappedJobs: MappedWorkdayJob[] = [];
  let skipped = 0;

  const source = `workday-${slugify(config.companyName)}`;

  for (const rawJob of rawJobs) {
    const externalId = toNullableString(getByPath(rawJob, config.fieldMap.id));
    const title = toNullableString(getByPath(rawJob, config.fieldMap.title));
    const location = toNullableString(getByPath(rawJob, config.fieldMap.location));
    const externalPath = toNullableString(getByPath(rawJob, config.fieldMap.externalPath));

    if (!externalId || !title || !location || !externalPath) {
      skipped += 1;
      continue;
    }

    const postingStartDate = toIsoOrNull(
      toNullableString(
        config.fieldMap.postingStartDate
          ? getByPath(rawJob, config.fieldMap.postingStartDate)
          : null
      )
    );
    const postingEndDate = toIsoOrNull(
      toNullableString(
        config.fieldMap.postingEndDate
          ? getByPath(rawJob, config.fieldMap.postingEndDate)
          : null
      )
    );
    const description =
      toNullableString(
        config.fieldMap.description
          ? getByPath(rawJob, config.fieldMap.description)
          : null
      ) || `Imported from Workday (${config.companyName})`;

    const rawJobType = toNullableString(
      config.fieldMap.jobType ? getByPath(rawJob, config.fieldMap.jobType) : null
    );

    const applyBase = config.applyBaseUrl.replace(/\/+$/, '');
    const applyPath = externalPath.startsWith('/') ? externalPath : `/${externalPath}`;

    mappedJobs.push({
      created_by: config.ownerUserId,
      title,
      description,
      company_name: config.companyName,
      location,
      job_type: normalizeJobType(rawJobType),
      status: resolveStatus(postingEndDate),
      external_id: externalId,
      external_path: externalPath,
      apply_url: `${applyBase}${applyPath}`,
      source,
      posting_start_date: postingStartDate,
      posting_end_date: postingEndDate,
      imported_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return { mappedJobs, skipped };
}
