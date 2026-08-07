export type JobLocation = "Remote" | "Accra" | "Hybrid";
export type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship";

export type Job = {
  slug: string;
  title: string;
  location: JobLocation;
  employmentType: EmploymentType;
  summary: string;
  description: string;
};

export const CAREERS_EMAIL = "getsafereceipts@gmail.com";

/** Add openings here. An empty array shows the empty-state copy on /careers. */
export const jobs: Job[] = [
 
];

export function getJobBySlug(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

export function getApplyMailto(title: string): string {
  const subject = encodeURIComponent(`Application: ${title}`);
  return `mailto:${CAREERS_EMAIL}?subject=${subject}`;
}
