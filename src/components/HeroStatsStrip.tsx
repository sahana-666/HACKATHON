import type { EventSummary } from "../api";
import { uniqueCategories } from "../lib/categoryColors";
import styles from "./HeroStatsStrip.module.css";

type Props =
  | { status: "loading" }
  | { status: "ok"; events: EventSummary[] }
  | { status: "error" };

export function HeroStatsStrip(props: Props) {
  if (props.status === "error") return null;

  if (props.status === "loading") {
    return (
      <div className={styles.strip} aria-busy="true" aria-label="Loading event statistics">
        <div className={styles.inner}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.stat}>
              <div className={`${styles.skelValue} skeleton-shimmer`} />
              <div className={`${styles.skelLabel} skeleton-shimmer`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const total = props.events.length;
  const categories = uniqueCategories(props.events).length;
  const free = props.events.filter((e) => (e.price ?? 0) === 0).length;

  const items = [
    { label: "Total events", value: total },
    { label: "Categories", value: categories },
    { label: "Free to join", value: free },
  ];

  return (
    <div className={styles.strip}>
      <dl className={styles.inner}>
        {items.map((item) => (
          <div key={item.label} className={styles.stat}>
            <dd className={styles.value}>{item.value}</dd>
            <dt className={styles.label}>{item.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
