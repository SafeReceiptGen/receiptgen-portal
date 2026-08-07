import Link from "next/link";
import type { Job } from "@/lib/careers/jobs";
import { getApplyMailto } from "@/lib/careers/jobs";

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="border-b border-foreground/10 py-10 last:border-b-0">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl space-y-3">
          <Link
            href={`/careers/${job.slug}`}
            className="group inline-block"
          >
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary md:text-3xl">
              {job.title}
            </h2>
          </Link>
          <p className="text-sm font-medium text-foreground/50">
            {job.location} · {job.employmentType}
          </p>
          <p className="text-base leading-relaxed text-foreground/70">
            {job.summary}
          </p>
          <Link
            href={`/careers/${job.slug}`}
            className="inline-block text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            View full description →
          </Link>
        </div>
        <a
          href={getApplyMailto(job.title)}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Apply
        </a>
      </div>
    </article>
  );
}
