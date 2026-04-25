'use client';

import Link from 'next/link';
import { Job } from '@/lib/types';
import { Card } from './Card';
import { Badge } from './Badge';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min || !max) return 'Negotiable';
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const jobTypeColors: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
    'full-time': 'success',
    'part-time': 'info',
    contract: 'warning',
    temporary: 'default',
  };

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card hover className="cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#0F172A] mb-1 group-hover:text-[#2563EB] transition">
              {job.title}
            </h3>
            <p className="text-sm text-[#64748B] font-medium">{job.company_name}</p>
          </div>
          <Badge
            variant={jobTypeColors[job.job_type] || 'default'}
            size="sm"
          >
            {job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1)}
          </Badge>
        </div>

        {/* Meta Info */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span>📍</span>
            <span>{job.location}</span>
          </div>

          {job.salary_min && job.salary_max && (
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <span>💰</span>
              <span>{formatSalary(job.salary_min, job.salary_max)}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span>📅</span>
            <span>
              {new Date(job.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Description Preview */}
        <p className="text-sm text-[#64748B] line-clamp-2 mb-4">
          {job.description}
        </p>

        {/* Footer CTA */}
        <div className="pt-4 border-t-2 border-[#E2E8F0]">
          <p className="text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition">
            View Details →
          </p>
        </div>
      </Card>
    </Link>
  );
}
