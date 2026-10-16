export function categoryAccentClass(category: string | null | undefined): string {
  const c = (category ?? "").toLowerCase();
  let hash = 0;
  for (let i = 0; i < c.length; i++) hash = (hash + c.charCodeAt(i) * (i + 1)) % 997;
  const bucket = hash % 3;
  if (bucket === 0) return "accent-teal";
  if (bucket === 1) return "accent-rust";
  return "accent-mustard";
}

export function uniqueCategories(events: { category?: string }[]): string[] {
  const set = new Set<string>();
  for (const e of events) {
    const cat = e.category?.trim();
    if (cat) set.add(cat);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
