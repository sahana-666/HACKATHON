import type { EventSummary } from "../api";
import { useCardTilt } from "../hooks/useCardTilt";
import { categoryAccentClass } from "../lib/categoryColors";
import {
  formatDateRange,
  formatDeadline,
  formatPrice,
  isLowSeats,
  safeBlurb,
  safeCategory,
  safeName,
  seatsLeft,
} from "../lib/eventHelpers";
import { onCoverError, resizeCoverUrl } from "../lib/images";
import styles from "./EventCard.module.css";

type Props = {
  event: EventSummary;
  priority?: boolean;
  compact?: boolean;
};

export function EventCard({ event, priority = false, compact = false }: Props) {
  const tiltRef = useCardTilt<HTMLElement>();
  const accent = categoryAccentClass(event.category);
  const left = seatsLeft(event);
  const price = event.price ?? 0;
  const reg = event.registration_status ?? "CLOSED";
  const mode = event.event_mode ?? "OFFLINE";

  return (
    <article
      ref={tiltRef}
      className={`${styles.card} ${styles[accent]} ${compact ? styles.compact : ""}`}
    >
      <div className={styles.imageWrap}>
        <img
          src={resizeCoverUrl(event.cover_image_url)}
          alt={event.cover_image_alt?.trim() || safeName(event.name)}
          width={600}
          height={400}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className={styles.image}
          onError={onCoverError}
        />
        <div className={styles.stickers} aria-hidden="true">
          {price === 0 && <span className={`${styles.sticker} ${styles.pillMustard}`}>Free</span>}
          {event.is_featured && (
            <span className={`${styles.sticker} ${styles.pillTeal}`}>Featured</span>
          )}
          {reg === "SOLD_OUT" && (
            <span className={`${styles.sticker} ${styles.pillRust}`}>Sold out</span>
          )}
          {isLowSeats(event) && reg === "OPEN" && (
            <span className={`${styles.sticker} ${styles.pillRust}`}>Filling fast</span>
          )}
        </div>
      </div>
      <div className={styles.body}>
        <p className={`${styles.category} ${styles.categoryPill}`}>{safeCategory(event.category)}</p>
        <h3 className={styles.title}>{safeName(event.name)}</h3>
        {!compact && <p className={styles.blurb}>{safeBlurb(event.blurb)}</p>}
        <p className={styles.dates}>{formatDateRange(event.schedule_summary)}</p>
        <div className={styles.metaRow}>
          <span className={styles.modeBadge}>{mode === "ONLINE" ? "Online" : "On campus"}</span>
          <span className={styles.price}>{formatPrice(event)}</span>
        </div>
        <p className={left <= 8 ? `${styles.seats} ${styles.seatsUrgent}` : styles.seats}>
          {left === 0 ? "No seats left" : `${left} seat${left === 1 ? "" : "s"} left`}
        </p>
        <div className={styles.regRow}>
          <span className={`${styles.regBadge} ${styles[`reg_${reg}`]}`}>
            {reg.replace("_", " ")}
          </span>
          <span className={styles.deadline}>
            Reg. by {formatDeadline(event.registration_deadline)}
          </span>
        </div>
      </div>
    </article>
  );
}
