import { CAREERS_EMAIL } from "@/lib/careers/jobs";

export function JobsEmptyState() {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-8 py-16 text-center md:px-12">
      <div className="mx-auto max-w-2xl space-y-5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Help us build a better post-purchase experience.
        </h2>

        <p className="text-base leading-relaxed text-foreground/70 md:text-lg">
          At SafeReceipts, we&apos;re rethinking how technology can improve the
          retail experience for businesses and their customers.
        </p>

        <p className="text-base leading-relaxed text-foreground/70 md:text-lg">
          We&apos;re looking for motivated, curious, and entrepreneurial people
          who are excited to solve problems, challenge the status quo, and
          help turn ideas into impact.
        </p>

        <p className="text-base leading-relaxed text-foreground/70 md:text-lg">
          Whether your strengths are in{" "}
          <strong>
            engineering, marketing, product, customer success, or operations
          </strong>
          , we&apos;d love to hear from you.
        </p>

        <div className="pt-3">
          <h3 className="text-lg font-bold text-foreground md:text-xl">
            Interested in joining us?
          </h3>

          <p className="mt-2 text-base leading-relaxed text-foreground/70">
            Send us your CV and a short introduction about yourself and how
            you&apos;d like to contribute.
          </p>

          <a
            href={`mailto:${CAREERS_EMAIL}`}
            className="mt-4 inline-block font-semibold text-primary transition-opacity hover:opacity-80"
          >
            {CAREERS_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}