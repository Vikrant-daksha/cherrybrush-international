/**
 * Utility to create clean, URL-friendly slugs.
 * Converts "Rose Champagne & Glitter #1" -> "rose-champagne-glitter-1"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-") // Replace spaces, non-word characters and dashes with a single dash
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing dashes
}

/**
 * Generates a unique slug for a Mongoose model.
 * If 'rose-champagne' already exists, it checks 'rose-champagne-1', 'rose-champagne-2', etc.
 */
export async function generateUniqueSlug(
  model: any,
  name: string,
  customSlug?: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugify(customSlug && customSlug.trim() ? customSlug : name);
  
  if (!baseSlug) {
    return `product-${Date.now().toString(36)}`;
  }

  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    const query: any = { slug: candidateSlug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await model.findOne(query).select("_id").lean();
    if (!existing) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${counter}`;
    counter++;
  }
}
