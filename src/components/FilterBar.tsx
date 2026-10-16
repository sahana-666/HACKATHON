import { useEffect, useRef } from "react";
import { GROUP_LABELS, type GroupLabel } from "../lib/categoryGroups";
import type {
  FilterState,
  PriceRange,
  QuickFilter,
  SortOption,
} from "../hooks/useEventsFilters";
import styles from "./FilterBar.module.css";

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <p className={styles.sectionHead}>{children}</p>;
}

function ToggleChip({
  id,
  label,
  count,
  active,
  onToggle,
  muted,
}: {
  id: string;
  label: string;
  count?: number;
  active: boolean;
  onToggle: () => void;
  muted?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      className={`${styles.chip} ${active ? styles.chipActive : ""} ${muted ? styles.chipMuted : ""}`}
      aria-pressed={active}
      onClick={onToggle}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={styles.chipCount} aria-hidden="true">
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

type Props = {
  filters: FilterState;
  localQ: string;
  groupCounts: Record<string, number>;
  allDateLabels: { iso: string; label: string }[];
  totalFiltered: number;
  totalAll: number;
  onQ: (v: string) => void;
  onClearQ: () => void;
  onToggleGroup: (g: GroupLabel) => void;
  onToggleQuick: (qf: QuickFilter) => void;
  onToggleDate: (d: string) => void;
  onChange: (patch: Partial<FilterState>) => void;
};

const QUICK_DEFS: { key: QuickFilter; label: string }[] = [
  { key: "free", label: "Free" },
  { key: "open", label: "Reg. open" },
  { key: "online", label: "Online" },
  { key: "offline", label: "Offline" },
  { key: "workshops", label: "Workshops" },
  { key: "team", label: "Team (2+)" },
  { key: "solo", label: "Solo-friendly" },
  { key: "seatsLeft", label: "Seats left" },
];

const PRICE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "free", label: "Free" },
  { value: "under500", label: "< ₹500" },
  { value: "500-1000", label: "₹500–1k" },
  { value: "1000+", label: "₹1k+" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "soonest", label: "Soonest" },
  { value: "priceLow", label: "Price ↑" },
  { value: "priceHigh", label: "Price ↓" },
  { value: "mostSeats", label: "Most seats" },
  { value: "fillingFast", label: "Filling fast" },
];

// ─── Main component ──────────────────────────────────────────────────────────

export function FilterBar({
  filters,
  localQ,
  groupCounts,
  allDateLabels,
  totalFiltered,
  totalAll,
  onQ,
  onClearQ,
  onToggleGroup,
  onToggleQuick,
  onToggleDate,
  onChange,
}: Props) {
  const searchRef = useRef<HTMLInputElement>(null);

  // Esc clears search when input is focused
  useEffect(() => {
    const el = searchRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && document.activeElement === el) {
        onClearQ();
      }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [onClearQ]);

  return (
    <div className={styles.panel} aria-label="Filter and sort events">
      {/* ── Search ─────────────────────────────────────────── */}
      <div className={styles.searchWrap}>
        <label htmlFor="event-search" className={styles.srOnly}>
          Search events
        </label>
        <div className={styles.searchInner}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 20 20"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <line x1="13" y1="13" x2="18" y2="18" />
          </svg>
          <input
            ref={searchRef}
            id="event-search"
            type="search"
            className={styles.searchInput}
            placeholder="Search events…"
            value={localQ}
            onChange={(e) => onQ(e.target.value)}
            autoComplete="off"
            aria-label="Search events by name, tags or category"
          />
          {localQ && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={onClearQ}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        {/* Reserve height to avoid layout shift when message appears */}
        <p className={styles.searchHint} aria-live="polite">
          {localQ.trim() && totalFiltered === 0
            ? `No results for "${localQ.trim()}" — try clearing a filter`
            : " "}
        </p>
      </div>

      {/* ── Sort + show past ───────────────────────────────── */}
      <div className={styles.sortRow}>
        <label htmlFor="filter-sort" className={styles.label}>
          Sort
        </label>
        <select
          id="filter-sort"
          className={styles.select}
          value={filters.sort}
          onChange={(e) =>
            onChange({ sort: e.target.value as SortOption, page: 1 })
          }
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            className={styles.toggleInput}
            checked={filters.showPast}
            onChange={(e) => onChange({ showPast: e.target.checked })}
          />
          Show past &amp; closed
        </label>
      </div>

      {/* ── Quick filters ──────────────────────────────────── */}
      <div className={styles.section}>
        <SectionHeading>Quick filters</SectionHeading>
        <div className={styles.chipRow} role="group" aria-label="Quick filters">
          {QUICK_DEFS.map((qd) => (
            <ToggleChip
              key={qd.key}
              id={`qf-${qd.key}`}
              label={qd.label}
              active={filters.quick.includes(qd.key)}
              onToggle={() => onToggleQuick(qd.key)}
            />
          ))}
        </div>
      </div>

      {/* ── Category groups ────────────────────────────────── */}
      <div className={styles.section}>
        <SectionHeading>Category</SectionHeading>
        <div className={styles.chipColumn} role="group" aria-label="Category groups">
          {GROUP_LABELS.map((g) => {
            const count = groupCounts[g] ?? 0;
            return (
              <ToggleChip
                key={g}
                id={`g-${g.replace(/[^a-z0-9]/gi, "-")}`}
                label={g}
                count={count}
                active={filters.groups.includes(g)}
                onToggle={() => onToggleGroup(g)}
                muted={count === 0}
              />
            );
          })}
        </div>
      </div>

      {/* ── Date chips ─────────────────────────────────────── */}
      {allDateLabels.length > 0 && (
        <div className={styles.section}>
          <SectionHeading>Date</SectionHeading>
          <div className={styles.chipRow} role="group" aria-label="Filter by date">
            {allDateLabels.map(({ iso, label }) => (
              <ToggleChip
                key={iso}
                id={`d-${iso}`}
                label={label}
                active={filters.dates.includes(iso)}
                onToggle={() => onToggleDate(iso)}
              />
            ))}
            <ToggleChip
              id="d-past"
              label="Past events"
              active={filters.dates.includes("__past__")}
              onToggle={() => onToggleDate("__past__")}
            />
          </div>
        </div>
      )}

      {/* ── Price ──────────────────────────────────────────── */}
      <div className={styles.section}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.sectionHead}>Price</legend>
          <div className={styles.segmented} role="group">
            {PRICE_OPTIONS.map((o) => (
              <button
                key={o.value}
                id={`price-${o.value}`}
                type="button"
                className={`${styles.segment} ${filters.price === o.value ? styles.segmentActive : ""}`}
                aria-pressed={filters.price === o.value}
                onClick={() => onChange({ price: o.value, page: 1 })}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* ── Result count ───────────────────────────────────── */}
      <p className={styles.resultCount} aria-live="polite" aria-atomic="true">
        <strong>{totalFiltered}</strong> of {totalAll} event
        {totalAll !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
