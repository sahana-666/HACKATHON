import styles from "./FilterChips.module.css";

type Chip = { key: string; label: string; clear: () => void };

type Props = {
  chips: Chip[];
  onClearAll: () => void;
  hasActive: boolean;
};

export function FilterChips({ chips, onClearAll, hasActive }: Props) {
  if (!hasActive && chips.length === 0) return null;
  return (
    <div className={styles.wrap} aria-label="Active filters">
      <ul className={styles.list}>
        {chips.map((c) => (
          <li key={c.key}>
            <button type="button" className={styles.chip} onClick={c.clear}>
              <span>{c.label}</span>
              <span aria-hidden="true"> ×</span>
              <span className="visually-hidden">Remove filter</span>
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
  );
}
