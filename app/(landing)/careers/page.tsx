import type { Metadata } from "next";
import { JobCard } from "@/components/landing/v2/careers/JobCard";
import { JobsEmptyState } from "@/components/landing/v2/careers/JobsEmptyState";
import { jobs } from "@/lib/careers/jobs";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join SafeReceipts — open roles and opportunities to help build verified digital receipts for retailers in Ghana and beyond.",
};

export default function CareersPage() {
  const hasOpenings = jobs.length > 0;

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden pb-24 pt-32 lg:pb-32 lg:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(0,85,255,0.06),transparent_55%)]" />

        <div className="container mx-auto px-6 md:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/40">
              Careers
            </p>
            <h1 className="mb-6 font-display text-4xl font-bold tracking-tighter text-foreground md:text-5xl lg:text-6xl">
              Build the future of{" "}
              <span className="text-primary">receipts</span>
            </h1>
            <p className="text-lg leading-relaxed text-foreground/70 md:text-xl">
              SafeReceipts is replacing paper with verified digital receipts —
              making returns simpler for customers and more trustworthy for
              retailers. We&apos;re a small team that moves fast and cares about
              craft. If that sounds like you, we&apos;d love to hear from you.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-3xl lg:mt-24">
            <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Open roles
            </h2>
            {hasOpenings ? (
              <div className="border-t border-foreground/10">
                {jobs.map((job) => (
                  <JobCard key={job.slug} job={job} />
                ))}
              </div>
            ) : (
              <JobsEmptyState />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
