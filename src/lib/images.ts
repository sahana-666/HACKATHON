const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect fill="#EBC4A8" width="600" height="400"/>
      <rect x="24" y="24" width="552" height="352" fill="none" stroke="#2B2118" stroke-width="4"/>
      <text x="300" y="210" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="600" fill="#2B2118">Event cover</text>
    </svg>`
  );

export function resizeCoverUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return PLACEHOLDER;
  try {
    const u = new URL(url);
    u.searchParams.set("w", "600");
    u.searchParams.set("h", "400");
    u.searchParams.set("fit", "crop");
    return u.toString();
  } catch {
    return url;
  }
}

export function coverFallback(): string {
  return PLACEHOLDER;
}

export function onCoverError(e: { currentTarget: HTMLImageElement }) {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = "1";
  img.src = PLACEHOLDER;
}
