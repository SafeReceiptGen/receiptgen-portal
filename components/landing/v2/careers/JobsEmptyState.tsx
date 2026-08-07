import { CAREERS_EMAIL } from "@/lib/careers/jobs";

export function JobsEmptyState() {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-8 py-16 text-center md:px-12">
      <p className="mx-auto max-w-xl text-lg leading-relaxed text-foreground/70 md:text-xl">
        We&apos;re not hiring right now, but we&apos;re always looking for
        talented people. Send us your CV at{" "}
        <a
          href={`mailto:${CAREERS_EMAIL}`}
          className="font-medium text-primary transition-opacity hover:opacity-80"
        >
          {CAREERS_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
