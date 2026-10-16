import styles from "./Pagination.module.css";

type Props = {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
};

export function Pagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav className={styles.nav} aria-label="Events pagination">
      <button
        type="button"
        className={styles.btn}
        disabled={!prev}
        onClick={() => prev && onPage(prev)}
        aria-label="Previous page"
      >
        Prev
      </button>
      <p className={styles.status} aria-live="polite">
        Page <strong>{page}</strong> of {totalPages}
      </p>
      <button
        type="button"
        className={styles.btn}
        disabled={!next}
        onClick={() => next && onPage(next)}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
