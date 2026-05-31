import { prisma } from "./prisma";

/**
 * Converts a string (e.g. event title) into a clean, URL-safe slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")       // Replace spaces with -
    .replace(/[^\w\-]+/g, "")   // Remove all non-word chars
    .replace(/\-\-+/g, "-")     // Replace multiple - with single -
    .replace(/^-+/, "")         // Trim - from start of text
    .replace(/-+$/, "");        // Trim - from end of text
}

/**
 * Generates a unique event slug from a title. If the slug already exists
 * in the database, it appends a numeric suffix (e.g., event-title-1).
 */
export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title) || "event";
  let candidate = baseSlug;
  let count = 1;

  while (true) {
    const existing = await prisma.event.findUnique({
      where: { slug: candidate },
    });
    if (!existing) {
      return candidate;
    }
    candidate = `${baseSlug}-${count}`;
    count++;
  }
}
