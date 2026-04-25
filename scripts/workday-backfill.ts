import { createClient } from '@supabase/supabase-js';
import { getSingleWorkdayConfig } from '../lib/importers/workday/config';
import { fetchAllWorkdayJobs } from '../lib/importers/workday/client';
import { mapWorkdayJobs, MappedWorkdayJob } from '../lib/importers/workday/mapper';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
  };
}

// ✅ Proper type for DB row
type ExistingJob = {
  id: string;
};

async function fallbackUpsertByExternalId(
  supabaseAdmin: ReturnType<typeof createClient>,
  jobs: MappedWorkdayJob[]
) {
  let inserted = 0;
  let updated = 0;

  for (const job of jobs) {
    const { data: existing, error: selectError } = await supabaseAdmin
      .from('jobs')
      .select('id')
      .eq('source', job.source)
      .eq('external_id', job.external_id)
      .maybeSingle<ExistingJob>(); // ✅ FIXED typing here

    if (selectError) {
      throw new Error(
        `[workday-import] Fallback select failed for external_id=${job.external_id}: ${selectError.message}`
      );
    }

    if (existing?.id) {
      const { error: updateError } = await supabaseAdmin
        .from('jobs')
        .update(job)
        .eq('id', existing.id);

      if (updateError) {
        throw new Error(
          `[workday-import] Fallback update failed for external_id=${job.external_id}: ${updateError.message}`
        );
      }

      updated += 1;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('jobs')
        .insert([job]);

      if (insertError) {
        throw new Error(
          `[workday-import] Fallback insert failed for external_id=${job.external_id}: ${insertError.message}`
        );
      }

      inserted += 1;
    }
  }

  return { inserted, updated };
}

async function main() {
  const { dryRun } = parseCliArgs();

  const config = getSingleWorkdayConfig();

  console.log('[workday-import] Starting one-time backfill');
  console.log('[workday-import] Company:', config.companyName);
  console.log('[workday-import] Endpoint:', config.endpointUrl);
  console.log('[workday-import] Dry run:', dryRun);

  const { rawJobs, pagesFetched } = await fetchAllWorkdayJobs(config);
  const { mappedJobs, skipped } = mapWorkdayJobs(rawJobs, config);

  console.log('[workday-import] Pages fetched:', pagesFetched);
  console.log('[workday-import] Raw records fetched:', rawJobs.length);
  console.log('[workday-import] Valid mapped records:', mappedJobs.length);
  console.log('[workday-import] Skipped records:', skipped);

  if (mappedJobs.length === 0) {
    console.log('[workday-import] No valid jobs to import. Exiting.');
    return;
  }

  if (dryRun) {
    console.log('[workday-import] Dry-run sample (first 3):');
    console.log(JSON.stringify(mappedJobs.slice(0, 3), null, 2));
    return;
  }

  const supabaseAdmin = createClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
  );

  const chunkSize = 100;
  let processed = 0;
  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < mappedJobs.length; i += chunkSize) {
    const chunk = mappedJobs.slice(i, i + chunkSize);

    const { error } = await supabaseAdmin.from('jobs').upsert(chunk, {
      onConflict: 'source,external_id',
      ignoreDuplicates: false,
    });

    if (error) {
      if (error.message.includes('no unique or exclusion constraint')) {
        console.warn(
          '[workday-import] Upsert conflict target unavailable; using fallback dedupe mode.'
        );

        const result = await fallbackUpsertByExternalId(supabaseAdmin, chunk);
        inserted += result.inserted;
        updated += result.updated;
      } else {
        throw new Error(
          `[workday-import] Failed upserting chunk starting at ${i}: ${error.message}`
        );
      }
    }

    processed += chunk.length;
    console.log(`[workday-import] Upserted ${processed}/${mappedJobs.length}`);
  }

  console.log('[workday-import] Inserted rows:', inserted);
  console.log('[workday-import] Updated rows:', updated);
  console.log('[workday-import] Completed successfully');
}

main().catch((error) => {
  console.error('[workday-import] Failed:', error);
  process.exit(1);
});