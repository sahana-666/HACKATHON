import styles from "./FilterChips.module.css";

type Chip = { key: string; label: string; clear: () => void };

type Props = {
  chips: Chip[];
  onClearAll: () => void;
  hasActive: boolean;
  /** Inline count label, e.g. "12 of 30 events" */
  countLabel: string;
};

export function FilterChips({ chips, onClearAll, hasActive, countLabel }: Props) {
  return (
    <div className={styles.wrap}>
      {/* Live result count – always rendered to prevent layout shift */}
      <p className={styles.count} aria-live="polite" aria-atomic="true">
        {countLabel}
      </p>

      {(hasActive || chips.length > 0) && (
        <div className={styles.chipRow} aria-label="Active filters">
          <ul className={styles.list}>
            {chips.map((c) => (
              <li key={c.key}>
                <button
                  type="button"
                  className={styles.chip}
                  onClick={c.clear}
                  aria-label={`Remove filter: ${c.label}`}
                >
                  <span aria-hidden="true">{c.label}</span>
                  <span className={styles.x} aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
          {hasActive && (
            <button type="button" className={styles.clearAll} onClick={onClearAll}>
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
