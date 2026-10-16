import type { EventSummary } from "../api";

export function seatsLeft(e: EventSummary): number {
  const total = e.total_seats ?? 0;
  const filled = e.seats_filled ?? 0;
  return Math.max(0, total - filled);
}

export function isLowSeats(e: EventSummary): boolean {
  const left = seatsLeft(e);
  return left > 0 && left <= 8;
}

export function formatPrice(e: EventSummary): string {
  const price = e.price ?? 0;
  if (price === 0) return "Free";
  const unit = e.is_per_head ? "per person" : "per team";
  return `₹${price} ${unit}`;
}

export function formatDateRange(schedule: EventSummary["schedule_summary"] | undefined): string {
  if (!schedule?.start_date) return "Date TBA";
  const start = formatDate(schedule.start_date);
  const end = schedule.end_date && schedule.end_date !== schedule.start_date
    ? formatDate(schedule.end_date)
    : null;
  const time =
    schedule.start_time && schedule.end_time
      ? `${schedule.start_time} – ${schedule.end_time}`
      : schedule.start_time ?? "";
  if (end) return `${start} – ${end}${time ? ` · ${time}` : ""}`;
  return `${start}${time ? ` · ${time}` : ""}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function formatDeadline(deadline: string | null | undefined): string {
  if (!deadline) return "Deadline TBA";
  try {
    const d = new Date(deadline.includes("T") ? deadline : deadline + "T23:59:59");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return deadline;
  }
}

export function sortKeySoonest(e: EventSummary): number {
  const s = e.schedule_summary;
  if (!s?.start_date) return Number.MAX_SAFE_INTEGER;
  const t = s.start_time ?? "00:00";
  return new Date(`${s.start_date}T${t}`).getTime() || Number.MAX_SAFE_INTEGER;
}

export function searchHaystack(e: EventSummary): string {
  const tags = Array.isArray(e.tags) ? e.tags.join(" ") : "";
  return [e.name, e.blurb, tags].filter(Boolean).join(" ").toLowerCase();
}

export function safeBlurb(blurb: string | null | undefined, max = 120): string {
  const t = (blurb ?? "").trim();
  if (!t) return "Details coming soon.";
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

export function safeName(name: string | null | undefined): string {
  return (name ?? "").trim() || "Untitled event";
}

export function safeCategory(category: string | null | undefined): string {
  return (category ?? "").trim() || "General";
}
