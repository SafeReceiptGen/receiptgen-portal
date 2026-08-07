import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getApplyMailto,
  getJobBySlug,
  jobs,
} from "@/lib/careers/jobs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) {
    return { title: "Role not found" };
  }
  return {
    title: job.title,
    description: job.summary,
  };
}

export default async function CareerJobPage({ params }: PageProps) {
  const { slug } = await params;
  const job = getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  const paragraphs = job.description
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden pb-24 pt-32 lg:pb-32 lg:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(0,85,255,0.06),transparent_55%)]" />

        <div className="container mx-auto px-6 md:px-12">
          <div className="mx-auto max-w-2xl">
            <Link
              href="/careers"
              className="mb-10 inline-block text-sm font-medium text-foreground/50 transition-colors hover:text-primary"
            >
              ← All roles
            </Link>

            <h1 className="mb-4 font-display text-4xl font-bold tracking-tighter text-foreground md:text-5xl">
              {job.title}
            </h1>
            <p className="mb-10 text-sm font-medium text-foreground/50">
              {job.location} · {job.employmentType}
            </p>

            <div className="space-y-5 text-base leading-relaxed text-foreground/70 md:text-lg">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-12 border-t border-foreground/10 pt-10">
              <a
                href={getApplyMailto(job.title)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Apply for this role
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
