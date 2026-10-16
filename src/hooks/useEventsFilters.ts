import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { EventSummary } from "../api";
import { searchHaystack, seatsLeft, sortKeySoonest } from "../lib/eventHelpers";

export type SortOption = "soonest" | "price" | "seats";

export type FilterState = {
  q: string;
  category: string;
  mode: "" | "ONLINE" | "OFFLINE";
  type: "" | "EVENT" | "WORKSHOP";
  status: "" | "ACTIVE" | "COMPLETED" | "CLOSED";
  tech: "" | "technical" | "cultural";
  free: boolean;
  open: boolean;
  sort: SortOption;
  page: number;
};

const PAGE_SIZE = 12;

const defaults: FilterState = {
  q: "",
  category: "",
  mode: "",
  type: "",
  status: "",
  tech: "",
  free: false,
  open: false,
  sort: "soonest",
  page: 1,
};

function parseBool(v: string | null): boolean {
  return v === "1" || v === "true";
}

function parseFilters(params: URLSearchParams): FilterState {
  const sort = params.get("sort");
  const validSort: SortOption[] = ["soonest", "price", "seats"];
  const mode = params.get("mode");
  const type = params.get("type");
  const status = params.get("status");
  const tech = params.get("tech");
  return {
    q: params.get("q") ?? "",
    category: params.get("category") ?? "",
    mode: mode === "ONLINE" || mode === "OFFLINE" ? mode : "",
    type: type === "EVENT" || type === "WORKSHOP" ? type : "",
    status:
      status === "ACTIVE" || status === "COMPLETED" || status === "CLOSED" ? status : "",
    tech: tech === "technical" || tech === "cultural" ? tech : "",
    free: parseBool(params.get("free")),
    open: parseBool(params.get("open")),
    sort: validSort.includes(sort as SortOption) ? (sort as SortOption) : "soonest",
    page: Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1),
  };
}

function toParams(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.category) p.set("category", f.category);
  if (f.mode) p.set("mode", f.mode);
  if (f.type) p.set("type", f.type);
  if (f.status) p.set("status", f.status);
  if (f.tech) p.set("tech", f.tech);
  if (f.free) p.set("free", "1");
  if (f.open) p.set("open", "1");
  if (f.sort !== "soonest") p.set("sort", f.sort);
  if (f.page > 1) p.set("page", String(f.page));
  return p;
}

export function useEventsFilters(allEvents: EventSummary[] | null) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (patch: Partial<FilterState>, resetPage = true) => {
      const next = { ...filters, ...patch };
      if (resetPage && !("page" in patch)) next.page = 1;
      setSearchParams(toParams(next), { replace: true });
    },
    [filters, setSearchParams]
  );

  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const filtered = useMemo(() => {
    if (!allEvents) return [];
    const q = filters.q.trim().toLowerCase();
    let list = allEvents.filter((e) => {
      if (q && !searchHaystack(e).includes(q)) return false;
      if (filters.category && e.category !== filters.category) return false;
      if (filters.mode && e.event_mode !== filters.mode) return false;
      if (filters.type && e.event_type !== filters.type) return false;
      if (filters.status && e.event_status !== filters.status) return false;
      if (filters.tech === "technical" && !e.is_technical) return false;
      if (filters.tech === "cultural" && e.is_technical) return false;
      if (filters.free && (e.price ?? 0) !== 0) return false;
      if (filters.open && e.registration_status !== "OPEN") return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (filters.sort === "price") return (a.price ?? 0) - (b.price ?? 0);
      if (filters.sort === "seats") return seatsLeft(a) - seatsLeft(b);
      return sortKeySoonest(a) - sortKeySoonest(b);
    });
    return list;
  }, [allEvents, filters]);

  const featuredInResults = useMemo(
    () => filtered.filter((e) => e.is_featured),
    [filtered]
  );

  const nonFeaturedPaginated = useMemo(() => {
    const nonFeatured = filtered.filter((e) => !e.is_featured);
    const totalPages = Math.max(1, Math.ceil(nonFeatured.length / PAGE_SIZE));
    const page = Math.min(filters.page, totalPages);
    const start = (page - 1) * PAGE_SIZE;
    return {
      items: nonFeatured.slice(start, start + PAGE_SIZE),
      totalPages,
      page,
      totalNonFeatured: nonFeatured.length,
    };
  }, [filtered, filters.page]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    if (filters.q.trim())
      chips.push({ key: "q", label: `Search: “${filters.q.trim()}”`, clear: () => setFilters({ q: "" }) });
    if (filters.category)
      chips.push({
        key: "category",
        label: filters.category,
        clear: () => setFilters({ category: "" }),
      });
    if (filters.mode)
      chips.push({
        key: "mode",
        label: filters.mode === "ONLINE" ? "Online" : "Offline",
        clear: () => setFilters({ mode: "" }),
      });
    if (filters.type)
      chips.push({
        key: "type",
        label: filters.type === "EVENT" ? "Event" : "Workshop",
        clear: () => setFilters({ type: "" }),
      });
    if (filters.status)
      chips.push({
        key: "status",
        label: filters.status,
        clear: () => setFilters({ status: "" }),
      });
    if (filters.tech)
      chips.push({
        key: "tech",
        label: filters.tech === "technical" ? "Technical" : "Cultural",
        clear: () => setFilters({ tech: "" }),
      });
    if (filters.free)
      chips.push({ key: "free", label: "Free only", clear: () => setFilters({ free: false }) });
    if (filters.open)
      chips.push({
        key: "open",
        label: "Registration open",
        clear: () => setFilters({ open: false }),
      });
    if (filters.sort !== "soonest")
      chips.push({
        key: "sort",
        label: `Sort: ${filters.sort}`,
        clear: () => setFilters({ sort: "soonest" }),
      });
    return chips;
  }, [filters, setFilters]);

  const hasActiveFilters =
    filters.q.trim() !== "" ||
    filters.category !== "" ||
    filters.mode !== "" ||
    filters.type !== "" ||
    filters.status !== "" ||
    filters.tech !== "" ||
    filters.free ||
    filters.open ||
    filters.sort !== "soonest";

  return {
    filters,
    setFilters,
    clearAll,
    filtered,
    featuredInResults,
    pagination: nonFeaturedPaginated,
    activeChips,
    hasActiveFilters,
    pageSize: PAGE_SIZE,
    defaults,
  };
}
