import type { FilterState, SortOption } from "../hooks/useEventsFilters";
import styles from "./FilterBar.module.css";

type Props = {
  filters: FilterState;
  categories: string[];
  onChange: (patch: Partial<FilterState>) => void;
};

export function FilterBar({ filters, categories, onChange }: Props) {
  return (
    <form
      className={styles.bar}
      onSubmit={(e) => e.preventDefault()}
      aria-label="Filter and sort events"
    >
      <div className={styles.searchRow}>
        <label htmlFor="event-search" className={styles.label}>
          Search events
        </label>
        <input
          id="event-search"
          type="search"
          className={styles.input}
          placeholder="Name, blurb, or tags…"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          autoComplete="off"
        />
      </div>
      <div className={styles.filtersGrid}>
        <div>
          <label htmlFor="filter-category" className={styles.label}>
            Category
          </label>
          <select
            id="filter-category"
            className={styles.select}
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-mode" className={styles.label}>
            Mode
          </label>
          <select
            id="filter-mode"
            className={styles.select}
            value={filters.mode}
            onChange={(e) =>
              onChange({ mode: e.target.value as FilterState["mode"] })
            }
          >
            <option value="">All modes</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-type" className={styles.label}>
            Type
          </label>
          <select
            id="filter-type"
            className={styles.select}
            value={filters.type}
            onChange={(e) =>
              onChange({ type: e.target.value as FilterState["type"] })
            }
          >
            <option value="">All types</option>
            <option value="EVENT">Event</option>
            <option value="WORKSHOP">Workshop</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-status" className={styles.label}>
            Status
          </label>
          <select
            id="filter-status"
            className={styles.select}
            value={filters.status}
            onChange={(e) =>
              onChange({ status: e.target.value as FilterState["status"] })
            }
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-tech" className={styles.label}>
            Focus
          </label>
          <select
            id="filter-tech"
            className={styles.select}
            value={filters.tech}
            onChange={(e) =>
              onChange({ tech: e.target.value as FilterState["tech"] })
            }
          >
            <option value="">All focus</option>
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-sort" className={styles.label}>
            Sort by
          </label>
          <select
            id="filter-sort"
            className={styles.select}
            value={filters.sort}
            onChange={(e) =>
              onChange({ sort: e.target.value as SortOption, page: 1 })
            }
          >
            <option value="soonest">Soonest first</option>
            <option value="price">Price</option>
            <option value="seats">Seats left</option>
          </select>
        </div>
      </div>
      <div className={styles.toggles}>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={filters.free}
            onChange={(e) => onChange({ free: e.target.checked })}
          />
          Free only
        </label>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={filters.open}
            onChange={(e) => onChange({ open: e.target.checked })}
          />
          Registration open
        </label>
      </div>
    </form>
  );
}
