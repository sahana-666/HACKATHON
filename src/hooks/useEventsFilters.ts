import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { EventSummary } from "../api";
import { categoryToGroup, type GroupLabel } from "../lib/categoryGroups";
import {
  distinctStartDates,
  formatStartDate,
  searchHaystack,
  seatsLeft,
  sortKeySoonest,
} from "../lib/eventHelpers";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortOption =
  | "soonest"
  | "priceLow"
  | "priceHigh"
  | "mostSeats"
  | "fillingFast";

export type PriceRange = "any" | "free" | "under500" | "500-1000" | "1000+";

export type QuickFilter =
  | "free"
  | "open"
  | "online"
  | "offline"
  | "workshops"
  | "team"
  | "solo"
  | "seatsLeft";

export type FilterState = {
  q: string;
  groups: GroupLabel[];
  quick: QuickFilter[];
  dates: string[]; // ISO date strings e.g. "2026-11-14"
  showPast: boolean;
  price: PriceRange;
  sort: SortOption;
  page: number;
};

const PAGE_SIZE = 12;

const VALID_SORT: SortOption[] = [
  "soonest",
  "priceLow",
  "priceHigh",
  "mostSeats",
  "fillingFast",
];

const VALID_PRICE: PriceRange[] = ["any", "free", "under500", "500-1000", "1000+"];

const VALID_QUICK: QuickFilter[] = [
  "free",
  "open",
  "online",
  "offline",
  "workshops",
  "team",
  "solo",
  "seatsLeft",
];

const defaults: FilterState = {
  q: "",
  groups: [],
  quick: [],
  dates: [],
  showPast: false,
  price: "any",
  sort: "soonest",
  page: 1,
};

// ─── URL serialization ────────────────────────────────────────────────────────

function parseFilters(params: URLSearchParams): FilterState {
  const sort = params.get("sort") as SortOption;
  const price = params.get("price") as PriceRange;

  const rawGroups = params.getAll("g");
  const groups = rawGroups.filter((g): g is GroupLabel =>
    (["Tech & AI", "Robotics & Engineering", "Design & Art",
      "Performing Arts & Music", "Literary & Debate", "Gaming & Quiz",
      "Food, Culture & Other"] as string[]).includes(g)
  );

  const rawQuick = params.getAll("qf");
  const quick = rawQuick.filter((q): q is QuickFilter =>
    VALID_QUICK.includes(q as QuickFilter)
  );

  const dates = params.getAll("d").filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));

  return {
    q: params.get("q") ?? "",
    groups,
    quick,
    dates,
    showPast: params.get("past") === "1",
    price: VALID_PRICE.includes(price) ? price : "any",
    sort: VALID_SORT.includes(sort) ? sort : "soonest",
    page: Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1),
  };
}

function toParams(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  for (const g of f.groups) p.append("g", g);
  for (const qf of f.quick) p.append("qf", qf);
  for (const d of f.dates) p.append("d", d);
  if (f.showPast) p.set("past", "1");
  if (f.price !== "any") p.set("price", f.price);
  if (f.sort !== "soonest") p.set("sort", f.sort);
  if (f.page > 1) p.set("page", String(f.page));
  return p;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useEventsFilters(allEvents: EventSummary[] | null) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  // ── Debounced search: keep a local search string that commits to URL after 200ms
  const [localQ, setLocalQ] = useState(filters.q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync localQ when URL changes externally (e.g. back button)
  useEffect(() => {
    setLocalQ(filters.q);
  }, [filters.q]);

  const setQ = useCallback((value: string) => {
    setLocalQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams((prev) => {
        const next = parseFilters(prev);
        next.q = value;
        next.page = 1;
        return toParams(next);
      }, { replace: true });
    }, 200);
  }, [setSearchParams]);

  const clearQ = useCallback(() => {
    setLocalQ("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchParams((prev) => {
      const next = parseFilters(prev);
      next.q = "";
      next.page = 1;
      return toParams(next);
    }, { replace: true });
  }, [setSearchParams]);

  // ── General setter
  const setFilters = useCallback(
    (patch: Partial<FilterState>, resetPage = true) => {
      setSearchParams((prev) => {
        const current = parseFilters(prev);
        const next = { ...current, ...patch };
        if (resetPage && !("page" in patch)) next.page = 1;
        return toParams(next);
      }, { replace: true });
    },
    [setSearchParams]
  );

  const clearAll = useCallback(() => {
    setLocalQ("");
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // ── Toggle helpers for multi-select arrays
  const toggleGroup = useCallback((group: GroupLabel) => {
    setFilters({
      groups: filters.groups.includes(group)
        ? filters.groups.filter((g) => g !== group)
        : [...filters.groups, group],
    });
  }, [filters.groups, setFilters]);

  const toggleQuick = useCallback((qf: QuickFilter) => {
    // online/offline are mutually exclusive
    if (qf === "online" && filters.quick.includes("offline")) {
      setFilters({ quick: filters.quick.filter((q) => q !== "offline").concat("online") });
      return;
    }
    if (qf === "offline" && filters.quick.includes("online")) {
      setFilters({ quick: filters.quick.filter((q) => q !== "online").concat("offline") });
      return;
    }
    // free quick-filter and price=free are kept in sync
    setFilters({
      quick: filters.quick.includes(qf)
        ? filters.quick.filter((q) => q !== qf)
        : [...filters.quick, qf],
    });
  }, [filters.quick, setFilters]);

  const toggleDate = useCallback((date: string) => {
    setFilters({
      dates: filters.dates.includes(date)
        ? filters.dates.filter((d) => d !== date)
        : [...filters.dates, date],
    });
  }, [filters.dates, setFilters]);

  // ── Derived data
  const allDates = useMemo(
    () => (allEvents ? distinctStartDates(allEvents) : []),
    [allEvents]
  );

  // ── Filtering (memoized)
  const filtered = useMemo(() => {
    if (!allEvents) return [];
    const q = filters.q.trim().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let list = allEvents.filter((e) => {
      // Status: hide COMPLETED/CLOSED unless showPast
      if (!filters.showPast && (e.event_status === "COMPLETED" || e.event_status === "CLOSED")) {
        return false;
      }

      // Search (uses debounced URL value)
      if (q && !searchHaystack(e).includes(q)) return false;

      // Category groups (multi-select — OR logic within groups)
      if (filters.groups.length > 0) {
        const eGroup = categoryToGroup(e.category);
        if (!filters.groups.includes(eGroup)) return false;
      }

      // Quick filters (all active ones must match — AND logic)
      for (const qf of filters.quick) {
        if (qf === "free" && (e.price ?? 0) !== 0) return false;
        if (qf === "open" && e.registration_status !== "OPEN") return false;
        if (qf === "online" && e.event_mode !== "ONLINE") return false;
        if (qf === "offline" && e.event_mode !== "OFFLINE") return false;
        if (qf === "workshops" && e.event_type !== "WORKSHOP") return false;
        if (qf === "team" && (e.max_teamsize ?? 1) <= 1) return false;
        if (qf === "solo" && (e.min_teamsize ?? 1) !== 1) return false;
        if (qf === "seatsLeft" && e.registration_status === "SOLD_OUT") return false;
      }

      // Date chips (OR — show event if its start_date is in the selected set)
      if (filters.dates.length > 0) {
        const eDate = e.schedule_summary?.start_date;
        // "past" virtual date: events whose start_date is before today
        const isPast = eDate
          ? new Date(eDate + "T00:00:00") < today
          : false;
        const matchesDates = filters.dates.some((d) => {
          if (d === "__past__") return isPast;
          return eDate === d;
        });
        if (!matchesDates) return false;
      }

      // Price segment
      const price = e.price ?? 0;
      if (filters.price === "free" && price !== 0) return false;
      if (filters.price === "under500" && (price === 0 || price >= 500)) return false;
      if (filters.price === "500-1000" && (price < 500 || price > 1000)) return false;
      if (filters.price === "1000+" && price <= 1000) return false;

      return true;
    });

    // ── Sort
    list = [...list].sort((a, b) => {
      switch (filters.sort) {
        case "priceLow":
          return (a.price ?? 0) - (b.price ?? 0);
        case "priceHigh":
          return (b.price ?? 0) - (a.price ?? 0);
        case "mostSeats":
          return seatsLeft(b) - seatsLeft(a);
        case "fillingFast": {
          const ratioA =
            (a.total_seats ?? 0) > 0
              ? (a.seats_filled ?? 0) / (a.total_seats ?? 1)
              : 0;
          const ratioB =
            (b.total_seats ?? 0) > 0
              ? (b.seats_filled ?? 0) / (b.total_seats ?? 1)
              : 0;
          return ratioB - ratioA;
        }
        default:
          return sortKeySoonest(a) - sortKeySoonest(b);
      }
    });

    return list;
  }, [allEvents, filters]);

  // ── Group counts (based on filtered-without-group-filter, so counts update live)
  const groupCounts = useMemo(() => {
    if (!allEvents) return {} as Record<string, number>;
    const q = filters.q.trim().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Apply every filter except groups, so counts reflect remaining matches
    const base = allEvents.filter((e) => {
      if (!filters.showPast && (e.event_status === "COMPLETED" || e.event_status === "CLOSED")) return false;
      if (q && !searchHaystack(e).includes(q)) return false;
      for (const qf of filters.quick) {
        if (qf === "free" && (e.price ?? 0) !== 0) return false;
        if (qf === "open" && e.registration_status !== "OPEN") return false;
        if (qf === "online" && e.event_mode !== "ONLINE") return false;
        if (qf === "offline" && e.event_mode !== "OFFLINE") return false;
        if (qf === "workshops" && e.event_type !== "WORKSHOP") return false;
        if (qf === "team" && (e.max_teamsize ?? 1) <= 1) return false;
        if (qf === "solo" && (e.min_teamsize ?? 1) !== 1) return false;
        if (qf === "seatsLeft" && e.registration_status === "SOLD_OUT") return false;
      }
      if (filters.dates.length > 0) {
        const eDate = e.schedule_summary?.start_date;
        const isPast = eDate ? new Date(eDate + "T00:00:00") < today : false;
        const matchesDates = filters.dates.some((d) => d === "__past__" ? isPast : eDate === d);
        if (!matchesDates) return false;
      }
      const price = e.price ?? 0;
      if (filters.price === "free" && price !== 0) return false;
      if (filters.price === "under500" && (price === 0 || price >= 500)) return false;
      if (filters.price === "500-1000" && (price < 500 || price > 1000)) return false;
      if (filters.price === "1000+" && price <= 1000) return false;
      return true;
    });

    const counts: Record<string, number> = {};
    for (const e of base) {
      const g = categoryToGroup(e.category);
      counts[g] = (counts[g] ?? 0) + 1;
    }
    return counts;
  }, [allEvents, filters.q, filters.quick, filters.dates, filters.price, filters.showPast]);

  // ── Featured + pagination
  const featuredInResults = useMemo(
    () => filtered.filter((e) => e.is_featured),
    [filtered]
  );

  const pagination = useMemo(() => {
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

  // ── Active chips (removable)
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];

    if (filters.q.trim())
      chips.push({
        key: "q",
        label: `"${filters.q.trim()}"`,
        clear: clearQ,
      });

    for (const g of filters.groups)
      chips.push({
        key: `g:${g}`,
        label: g,
        clear: () => toggleGroup(g),
      });

    const quickLabels: Record<QuickFilter, string> = {
      free: "Free",
      open: "Reg. open",
      online: "Online",
      offline: "Offline",
      workshops: "Workshops",
      team: "Team events",
      solo: "Solo-friendly",
      seatsLeft: "Seats available",
    };
    for (const qf of filters.quick)
      chips.push({
        key: `qf:${qf}`,
        label: quickLabels[qf],
        clear: () => toggleQuick(qf),
      });

    for (const d of filters.dates) {
      const label = d === "__past__" ? "Past events" : formatStartDate(d);
      chips.push({ key: `d:${d}`, label, clear: () => toggleDate(d) });
    }

    if (filters.price !== "any") {
      const priceLabels: Record<PriceRange, string> = {
        any: "Any price",
        free: "Free",
        under500: "Under ₹500",
        "500-1000": "₹500–₹1 000",
        "1000+": "₹1 000+",
      };
      chips.push({
        key: "price",
        label: priceLabels[filters.price],
        clear: () => setFilters({ price: "any" }),
      });
    }

    if (filters.sort !== "soonest") {
      const sortLabels: Record<SortOption, string> = {
        soonest: "Soonest",
        priceLow: "Price ↑",
        priceHigh: "Price ↓",
        mostSeats: "Most seats",
        fillingFast: "Filling fast",
      };
      chips.push({
        key: "sort",
        label: `Sort: ${sortLabels[filters.sort]}`,
        clear: () => setFilters({ sort: "soonest" }),
      });
    }

    return chips;
  }, [filters, clearQ, toggleGroup, toggleQuick, toggleDate, setFilters]);

  const hasActiveFilters =
    filters.q.trim() !== "" ||
    filters.groups.length > 0 ||
    filters.quick.length > 0 ||
    filters.dates.length > 0 ||
    filters.showPast ||
    filters.price !== "any" ||
    filters.sort !== "soonest";

  return {
    // State
    filters,
    localQ,
    // Setters
    setFilters,
    setQ,
    clearQ,
    clearAll,
    toggleGroup,
    toggleQuick,
    toggleDate,
    // Derived
    filtered,
    featuredInResults,
    pagination,
    activeChips,
    hasActiveFilters,
    groupCounts,
    allDates,
    allDateLabels: allDates.map((d) => ({ iso: d, label: formatStartDate(d) })),
    pageSize: PAGE_SIZE,
    defaults,
  };
}
