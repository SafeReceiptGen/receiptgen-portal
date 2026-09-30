export const MAX_CATEGORY_LENGTH = 120;

export const STANDARD_CATEGORIES = [
  "Fashion & Clothing",
  "Electronics & Phones",
  "Beauty & Personal Care",
  "Food & Groceries",
  "Home & Kitchen",
  "Health & Wellness",
  "Baby & Kids",
  "Furniture & Home Décor",
  "Automotive & Hardware",
] as const;

export function normalizeCategory(
  input: string | null | undefined,
): string | null {
  if (input == null) return null;
  const trimmed = input.trim().replace(/\s+/g, " ").slice(0, MAX_CATEGORY_LENGTH);
  return trimmed.length > 0 ? trimmed : null;
}

export function uniqueCategories(
  values: Iterable<string | null | undefined>,
): string[] {
  const seen = new Map<string, string>();
  for (const raw of values) {
    const trimmed = normalizeCategory(raw);
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  }
  return [...seen.values()];
}

/** Standard categories first, then categories already used on this store or receipt. */
export function categoryOptions(
  values: Iterable<string | null | undefined>,
): string[] {
  return uniqueCategories([...STANDARD_CATEGORIES, ...values]);
}

export function resolveCategory(
  input: string | null | undefined,
  existing: readonly string[],
): string | null {
  const trimmed = normalizeCategory(input);
  if (!trimmed) return null;
  const key = trimmed.toLowerCase();
  const match = existing.find(
    (category) => normalizeCategory(category)?.toLowerCase() === key,
  );
  return match ?? trimmed;
}
