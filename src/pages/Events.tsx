import { useState } from "react";
import {
  EmptyApiPanel,
  ErrorPanel,
  EventsGridSkeleton,
} from "../components/ApiStates";
import { EventCard } from "../components/EventCard";
import { FeaturedRow } from "../components/FeaturedRow";
import { FilterBar } from "../components/FilterBar";
import { FilterChips } from "../components/FilterChips";
import { FilterSheet } from "../components/FilterSheet";
import { PageMeta } from "../components/PageMeta";
import { Pagination } from "../components/Pagination";
import { useEventsData } from "../hooks/useEventsData";
import { useEventsFilters } from "../hooks/useEventsFilters";
import styles from "./Events.module.css";

export default function Events() {
  const { state, retry } = useEventsData();
  const events = state.status === "ok" ? state.events : null;
  const totalAll = events?.length ?? 0;

  const {
    filters,
    localQ,
    setFilters,
    setQ,
    clearQ,
    clearAll,
    toggleGroup,
    toggleQuick,
    toggleDate,
    filtered,
    featuredInResults,
    pagination,
    activeChips,
    hasActiveFilters,
    groupCounts,
    allDateLabels,
  } = useEventsFilters(events);

  const [sheetOpen, setSheetOpen] = useState(false);
  const activeFilterCount =
    filters.groups.length +
    filters.quick.length +
    filters.dates.length +
    (filters.q.trim() ? 1 : 0) +
    (filters.price !== "any" ? 1 : 0) +
    (filters.showPast ? 1 : 0) +
    (filters.sort !== "soonest" ? 1 : 0);

  const countLabel =
    events == null
      ? " " // non-breaking space keeps height reserved during loading
      : `${filtered.length} of ${totalAll} event${totalAll !== 1 ? "s" : ""}`;

  // The shared FilterBar props
  const filterBarProps = {
    filters,
    localQ,
    groupCounts,
    allDateLabels,
    totalFiltered: filtered.length,
    totalAll,
    onQ: setQ,
    onClearQ: clearQ,
    onToggleGroup: toggleGroup,
    onToggleQuick: toggleQuick,
    onToggleDate: toggleDate,
    onChange: (patch: Parameters<typeof setFilters>[0]) => setFilters(patch),
  };

  return (
    <>
      <PageMeta
        title="All Events | Render72"
        description="Browse, filter, and sort every campus event and workshop. Search by tags, snag free seats, and register before deadlines."
      />
      <div className={styles.page}>
        {/* ── Page header ───────────────────────────────── */}
        <header className={styles.pageHeader}>
          <h1 className={`${styles.h1} reveal`}>All events</h1>
          <p className={`${styles.lead} reveal reveal-delay-1`}>
            Search the full lineup — filters sync to the URL so you can share the perfect shortlist.
          </p>
        </header>

        {/* ── Loading / error / empty ────────────────────── */}
        {state.status === "loading" && <EventsGridSkeleton />}
        {state.status === "error" && (
          <ErrorPanel error={state.error} onRetry={() => void retry()} />
        )}
        {state.status === "ok" && state.events.length === 0 && <EmptyApiPanel />}

        {/* ── Main layout (sidebar + results) ───────────── */}
        {state.status === "ok" && state.events.length > 0 && (
          <div className={styles.layout}>
            {/* ── Desktop sidebar ─────────────────────────── */}
            <aside className={styles.sidebar} aria-label="Filters">
              <FilterBar {...filterBarProps} />
            </aside>

            {/* ── Results column ──────────────────────────── */}
            <div className={styles.results}>
              {/* Mobile: search + sort row + filter toggle button */}
              <div className={styles.mobileControls}>
                <div className={styles.mobileSearch}>
                  <label htmlFor="mobile-search" className={styles.srOnly}>
                    Search events
                  </label>
                  <input
                    id="mobile-search"
                    type="search"
                    className={styles.mobileSearchInput}
                    placeholder="Search events…"
                    value={localQ}
                    onChange={(e) => setQ(e.target.value)}
                    autoComplete="off"
                    aria-label="Search events"
                  />
                </div>
                <div className={styles.mobileRow}>
                  <select
                    id="mobile-sort"
                    className={styles.mobileSelect}
                    value={filters.sort}
                    aria-label="Sort events"
                    onChange={(e) =>
                      setFilters({ sort: e.target.value as typeof filters.sort, page: 1 })
                    }
                  >
                    <option value="soonest">Soonest</option>
                    <option value="priceLow">Price ↑</option>
                    <option value="priceHigh">Price ↓</option>
                    <option value="mostSeats">Most seats</option>
                    <option value="fillingFast">Filling fast</option>
                  </select>
                  <button
                    id="filter-sheet-toggle"
                    type="button"
                    className={styles.filterToggle}
                    aria-expanded={sheetOpen}
                    aria-controls="filter-sheet"
                    onClick={() => setSheetOpen(true)}
                  >
                    Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                  </button>
                </div>
              </div>

              {/* Active filter chips + count (always rendered to prevent CLS) */}
              <FilterChips
                chips={activeChips}
                onClearAll={clearAll}
                hasActive={hasActiveFilters}
                countLabel={countLabel}
              />

              {/* Results */}
              {filtered.length === 0 && events != null ? (
                <div className={styles.emptyFilters} role="status">
                  <p className={styles.emptyTitle}>
                    {filters.q.trim()
                      ? `No results for "${filters.q.trim()}"`
                      : "No events match these filters"}
                  </p>
                  <p className={styles.emptyBody}>
                    {!filters.showPast
                      ? "Past and closed events are hidden — try enabling them, or "
                      : "Try "}
                    <button
                      type="button"
                      className={styles.emptyAction}
                      onClick={clearAll}
                    >
                      clearing all filters
                    </button>
                    .
                  </p>
                  {!filters.showPast && (
                    <button
                      type="button"
                      className={styles.emptySecondary}
                      onClick={() => setFilters({ showPast: true })}
                    >
                      Show past &amp; closed events
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <FeaturedRow events={featuredInResults} priorityImages />
                  <section className={styles.gridSection} aria-label="Event results">
                    <div className={`${styles.grid} reveal-stagger`}>
                      {pagination.items.map((e, i) => (
                        <EventCard
                          key={e.id}
                          event={e}
                          priority={featuredInResults.length === 0 && i < 4}
                        />
                      ))}
                    </div>
                  </section>
                  <Pagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    onPage={(p) => setFilters({ page: p }, false)}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile filter sheet ───────────────────────────── */}
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onClear={clearAll}
        resultCount={filtered.length}
      >
        <FilterBar {...filterBarProps} />
      </FilterSheet>
    </>
  );
}
