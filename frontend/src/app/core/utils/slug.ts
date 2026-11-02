/** "Audit & Assurance" -> "audit-assurance". Used for the Services page `?category=` link. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Section on the Services page the category links scroll to. */
export const SERVICES_CATALOG_FRAGMENT = 'catalog';
