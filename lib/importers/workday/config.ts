export type PaginationMode = 'offset-limit' | 'page-size';

export interface WorkdayImporterConfig {
  companyName: string;
  endpointUrl: string;
  headers: Record<string, string>;
  baseRequestBody: Record<string, unknown>;
  paginationMode: PaginationMode;
  pageSize: number;
  startOffset?: number;
  startPage?: number;
  responseItemsPath: string;
  responseTotalPath?: string;
  ownerUserId: string;
  applyBaseUrl: string;
  fieldMap: {
    id: string;
    title: string;
    location: string;
    externalPath: string;
    postingStartDate?: string;
    postingEndDate?: string;
    description?: string;
    jobType?: string;
  };
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getOptionalNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function parseJsonEnv(name: string, fallback: Record<string, unknown>): Record<string, unknown> {
  const raw = process.env[name];
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error();
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error(`${name} must be a valid JSON object`);
  }
}

export function getSingleWorkdayConfig(): WorkdayImporterConfig {
  const paginationMode =
    process.env.WORKDAY_PAGINATION_MODE === 'page-size' ? 'page-size' : 'offset-limit';

  return {
    companyName: getRequiredEnv('WORKDAY_COMPANY_NAME'),
    endpointUrl: getRequiredEnv('WORKDAY_ENDPOINT_URL'),
    headers: parseJsonEnv('WORKDAY_HEADERS_JSON', { 'Content-Type': 'application/json' }) as Record<string, string>,
    baseRequestBody: parseJsonEnv('WORKDAY_BASE_BODY_JSON', {}),
    paginationMode,
    pageSize: getOptionalNumberEnv('WORKDAY_PAGE_SIZE', 20),
    startOffset: Number(process.env.WORKDAY_START_OFFSET || 0),
    startPage: Number(process.env.WORKDAY_START_PAGE || 0),
    responseItemsPath: getRequiredEnv('WORKDAY_RESPONSE_ITEMS_PATH'),
    responseTotalPath: process.env.WORKDAY_RESPONSE_TOTAL_PATH || undefined,
    ownerUserId: getRequiredEnv('WORKDAY_OWNER_USER_ID'),
    applyBaseUrl: getRequiredEnv('WORKDAY_APPLY_BASE_URL'),
    fieldMap: {
      id: getRequiredEnv('WORKDAY_FIELD_ID'),
      title: getRequiredEnv('WORKDAY_FIELD_TITLE'),
      location: getRequiredEnv('WORKDAY_FIELD_LOCATION'),
      externalPath: getRequiredEnv('WORKDAY_FIELD_EXTERNAL_PATH'),
      postingStartDate: process.env.WORKDAY_FIELD_POSTING_START_DATE || undefined,
      postingEndDate: process.env.WORKDAY_FIELD_POSTING_END_DATE || undefined,
      description: process.env.WORKDAY_FIELD_DESCRIPTION || undefined,
      jobType: process.env.WORKDAY_FIELD_JOB_TYPE || undefined,
    },
  };
}
