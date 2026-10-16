import styles from "./Marquee.module.css";

type Props = { items: string[] };

export function Marquee({ items }: Props) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div className={`${styles.wrap} marquee-wrap`} aria-hidden="true">
      <div className={`${styles.track} marquee-track`}>
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className={styles.item}>
            {item}
            <span className={styles.dot}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
