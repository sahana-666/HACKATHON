import { ApiError } from "../api";
import styles from "./ApiStates.module.css";

export function PageSkeleton() {
  return (
    <div className={styles.pageWrap} aria-busy="true" aria-label="Loading page">
      <div className={`${styles.heroSkel} skeleton-shimmer`} />
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${styles.cardSkel} skeleton-shimmer`} />
        ))}
      </div>
      <p className={styles.loadingCopy}>Warming up the fest lineup…</p>
    </div>
  );
}

export function EventsGridSkeleton() {
  return (
    <div className={styles.grid} aria-busy="true" aria-label="Loading events">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className={`${styles.cardSkel} skeleton-shimmer`} />
      ))}
      <p className={styles.loadingCopy}>Warming up the fest lineup…</p>
    </div>
  );
}

function errorMessage(err: ApiError): { title: string; body: string } {
  switch (err.kind) {
    case "timeout":
      return {
        title: "This is taking forever",
        body: "The request timed out. Give it another shot?",
      };
    case "server":
      return {
        title: "Oops",
        body: "The server tripped over its shoelaces. Try again?",
      };
    case "network":
      return {
        title: "You're offline?",
        body: "Couldn't reach the server. Check your connection and retry.",
      };
    default:
      return {
        title: "Something went sideways",
        body: err.message || "Try again in a moment.",
      };
  }
}

type ErrorPanelProps = {
  error: ApiError;
  onRetry: () => void;
};

export function ErrorPanel({ error, onRetry }: ErrorPanelProps) {
  const { title, body } = errorMessage(error);
  return (
    <div className={styles.errorPanel} role="alert">
      <h2 className={styles.errorTitle}>{title}</h2>
      <p>{body}</p>
      <p className={styles.errorKind}>
        <span className="visually-hidden">Error type: </span>
        {error.kind}
      </p>
      <button type="button" className={styles.retryBtn} onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

type EmptyApiProps = {
  message?: string;
};

export function EmptyApiPanel({ message = "No events on the board yet. Check back soon!" }: EmptyApiProps) {
  return (
    <div className={styles.emptyPanel}>
      <h2 className={styles.emptyTitle}>Quiet campus</h2>
      <p>{message}</p>
    </div>
  );
}

type EmptyFiltersProps = {
  onClear: () => void;
};

export function EmptyFiltersPanel({ onClear }: EmptyFiltersProps) {
  return (
    <div className={styles.emptyPanel}>
      <h2 className={styles.emptyTitle}>Nothing matched. Even we&apos;re surprised.</h2>
      <p>Loosen a filter or two — something fun is hiding in there.</p>
      <button type="button" className={styles.retryBtn} onClick={onClear}>
        Clear all filters
      </button>
    </div>
  );
}
