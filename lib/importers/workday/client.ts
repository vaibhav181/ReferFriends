import { WorkdayImporterConfig } from './config';

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

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit,
  maxAttempts = 3
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(input, init);
      if (response.ok) return response;
      if (attempt === maxAttempts) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) throw error;
    }
    const backoffMs = attempt * 400;
    await new Promise((resolve) => setTimeout(resolve, backoffMs));
  }
  throw lastError instanceof Error ? lastError : new Error('Unknown fetch error');
}

export interface FetchWorkdayJobsResult {
  rawJobs: Record<string, unknown>[];
  pagesFetched: number;
}

export async function fetchAllWorkdayJobs(
  config: WorkdayImporterConfig
): Promise<FetchWorkdayJobsResult> {
  const jobs: Record<string, unknown>[] = [];
  let pagesFetched = 0;

  let offset = config.startOffset || 0;
  let page = config.startPage || 0;

  for (;;) {
    const paginationPayload =
      config.paginationMode === 'page-size'
        ? { page, size: config.pageSize }
        : { offset, limit: config.pageSize };

    const body = JSON.stringify({
      ...config.baseRequestBody,
      ...paginationPayload,
    });

    const response = await fetchWithRetry(config.endpointUrl, {
      method: 'POST',
      headers: config.headers,
      body,
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(
        `Workday fetch failed (${response.status}): ${responseText.slice(0, 400)}`
      );
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const pageItems = getByPath(payload, config.responseItemsPath);
    const items = Array.isArray(pageItems)
      ? (pageItems as Record<string, unknown>[])
      : [];

    pagesFetched += 1;
    jobs.push(...items);

    const total = config.responseTotalPath
      ? Number(getByPath(payload, config.responseTotalPath))
      : NaN;

    if (items.length === 0) break;

    if (Number.isFinite(total) && jobs.length >= total) break;

    if (items.length < config.pageSize) break;

    if (config.paginationMode === 'page-size') {
      page += 1;
    } else {
      offset += config.pageSize;
    }
  }

  return { rawJobs: jobs, pagesFetched };
}
