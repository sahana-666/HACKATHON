import { useEffect } from "react";
import {
  EmptyApiPanel,
  EmptyFiltersPanel,
  ErrorPanel,
  EventsGridSkeleton,
} from "../components/ApiStates";
import { EventCard } from "../components/EventCard";
import { FeaturedRow } from "../components/FeaturedRow";
import { FilterBar } from "../components/FilterBar";
import { FilterChips } from "../components/FilterChips";
import { PageMeta } from "../components/PageMeta";
import { Pagination } from "../components/Pagination";
import { uniqueCategories } from "../lib/categoryColors";
import { useEventsData } from "../hooks/useEventsData";
import { useEventsFilters } from "../hooks/useEventsFilters";
import styles from "./Events.module.css";

export default function Events() {
  const { state, retry } = useEventsData();
  const events = state.status === "ok" ? state.events : null;
  const {
    filters,
    setFilters,
    clearAll,
    filtered,
    featuredInResults,
    pagination,
    activeChips,
    hasActiveFilters,
  } = useEventsFilters(events);

  useEffect(() => {
    if (pagination.page !== filters.page && events) {
      setFilters({ page: pagination.page }, false);
    }
  }, [pagination.page, filters.page, events, setFilters]);

  return (
    <>
      <PageMeta
        title="All Events | Render72"
        description="Browse, filter, and sort every campus event and workshop. Search by tags, snag free seats, and register before deadlines."
      />
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1 className={`${styles.h1} reveal`}>All events</h1>
          <p className={`${styles.lead} reveal reveal-delay-1`}>
            Search the full lineup — filters sync to the URL so you can share the perfect shortlist.
          </p>
        </header>

        {state.status === "loading" && <EventsGridSkeleton />}

        {state.status === "error" && (
          <ErrorPanel error={state.error} onRetry={() => void retry()} />
        )}

        {state.status === "ok" && state.events.length === 0 && <EmptyApiPanel />}

        {state.status === "ok" && state.events.length > 0 && (
          <>
            <FilterBar
              filters={filters}
              categories={uniqueCategories(state.events)}
              onChange={(patch) => setFilters(patch)}
            />
            <FilterChips chips={activeChips} onClearAll={clearAll} hasActive={hasActiveFilters} />
            <p className={styles.count} aria-live="polite">
              <strong>{filtered.length}</strong> event{filtered.length === 1 ? "" : "s"} match
              {filtered.length !== state.events.length && (
                <span> (of {state.events.length} total)</span>
              )}
            </p>

            {filtered.length === 0 ? (
              <EmptyFiltersPanel onClear={clearAll} />
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
          </>
        )}
      </div>
    </>
  );
}
