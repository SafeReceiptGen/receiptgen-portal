export const MAX_CATEGORY_LENGTH = 120;

export function uniqueCategories(
  values: Iterable<string | null | undefined>,
): string[] {
  const seen = new Map<string, string>();
  for (const raw of values) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  }
  return [...seen.values()];
}

export function resolveCategory(
  input: string | null | undefined,
  existing: readonly string[],
): string | null {
  const trimmed = input?.trim().slice(0, MAX_CATEGORY_LENGTH);
  if (!trimmed) return null;
  const key = trimmed.toLowerCase();
  const match = existing.find((category) => category.trim().toLowerCase() === key);
  return match ?? trimmed;
}
