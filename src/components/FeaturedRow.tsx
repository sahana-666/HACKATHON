import type { EventSummary } from "../api";
import { EventCard } from "./EventCard";
import styles from "./FeaturedRow.module.css";

type Props = {
  events: EventSummary[];
  priorityImages?: boolean;
  showHeading?: boolean;
  headingId?: string;
};

export function FeaturedRow({
  events,
  priorityImages = false,
  showHeading = true,
  headingId = "featured-heading",
}: Props) {
  if (events.length === 0) return null;
  return (
    <section
      className={styles.section}
      aria-labelledby={showHeading ? headingId : undefined}
    >
      {showHeading && (
        <h2 id={headingId} className={styles.heading}>
          Featured
        </h2>
      )}
      <div className={`${styles.scroll} reveal-stagger`}>
        {events.map((e, i) => (
          <div key={e.id} className={styles.item}>
            <EventCard event={e} priority={priorityImages && i < 4} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
