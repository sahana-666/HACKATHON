const BASE = import.meta.env.VITE_API_BASE ?? "https://render72.pages.dev";

export type EventSummary = {
  id: string; name: string; blurb: string;
  cover_image_url: string; cover_image_alt: string;
  category: string; tags: string[];
  event_type: "EVENT" | "WORKSHOP";
  event_mode: "OFFLINE" | "ONLINE";
  event_status: "ACTIVE" | "COMPLETED" | "CLOSED";
  is_featured: boolean; is_technical: boolean;
  price: number; is_per_head: boolean;
  min_teamsize: number; max_teamsize: number;
  total_seats: number; seats_filled: number;
  registration_status: "OPEN" | "CLOSED" | "SOLD_OUT";
  registration_deadline: string;
  schedule_summary: { start_date: string; start_time: string; end_date: string; end_time: string };
};

export type EventDetail = EventSummary & {
  description: string; banner_image_url: string; banner_image_alt: string;
  gallery_images: string[]; highlights: string[]; what_to_expect: string[];
  eligibility: string[]; prerequisites: string[]; rules: string[];
  prizes: { rank: number; title: string; amount: number; description: string }[];
  faqs: { question: string; answer: string }[];
  schedules: { event_date: string; start_time: string; end_time: string; venue: string }[];
  organizers: { id: string; name: string; org_type: string }[];
  coordinators: { id: string; name: string; role: string; contact: string }[];
};

export type ErrorKind = "network" | "timeout" | "server" | "not_found" | "invalid";
export class ApiError extends Error {
  constructor(public kind: ErrorKind, message: string, public status?: number) { super(message); }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function request<T>(path: string, retries = 3, timeoutMs = 8000): Promise<T> {
  let last: ApiError | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(`${BASE}${path}`, { signal: ctrl.signal, headers: { Accept: "application/json" } });
      if (res.status === 404) throw new ApiError("not_found", "Not found", 404);
      if (!res.ok) throw new ApiError("server", `Server error (${res.status})`, res.status);
      try { return (await res.json()) as T; }
      catch { throw new ApiError("invalid", "Unreadable response from server"); }
    } catch (e) {
      const err = e instanceof ApiError ? e
        : (e as Error)?.name === "AbortError" ? new ApiError("timeout", "The request timed out")
        : new ApiError("network", "Couldn't reach the server");
      if (err.kind === "not_found") throw err;
      last = err;
      if (attempt < retries) await sleep(300 * 2 ** attempt); // 300, 600, 1200ms
    } finally { clearTimeout(timer); }
  }
  throw last!;
}

// Cache + de-duplication of in-flight requests (5 min TTL)
const cache = new Map<string, { exp: number; data: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return Promise.resolve(hit.data as T);
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;
  const p = load()
    .then((d) => { cache.set(key, { exp: Date.now() + 5 * 60_000, data: d }); return d; })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

export const getEvents = () =>
  cached("events", async () => {
    const body = await request<{ events?: EventSummary[] }>("/api/test/events");
    if (!Array.isArray(body.events)) throw new ApiError("invalid", "Unexpected data format");
    return body.events; // [] is valid, so the UI shows the empty state
  });

export const getEvent = (id: string) =>
  cached(`event:${id}`, async () => {
    const body = await request<{ event?: EventDetail }>(`/api/test/events/${encodeURIComponent(id)}`);
    if (!body.event) throw new ApiError("invalid", "Unexpected data format");
    return body.event;
  });