import styles from "./Sunburst.module.css";

export function Sunburst() {
  return (
    <svg
      viewBox="0 0 400 220"
      width="400"
      height="220"
      role="img"
      aria-label="Decorative retro sunburst"
      className={styles.sunburst}
    >
      <path d="M10 210 A190 190 0 0 1 390 210 Z" fill="#B8462E" />
      <path d="M50 210 A150 150 0 0 1 350 210 Z" fill="#E2A93B" />
      <path d="M90 210 A110 110 0 0 1 310 210 Z" fill="#EBC4A8" />
      <path d="M130 210 A70 70 0 0 1 270 210 Z" fill="#2F6F73" />
      <path d="M170 210 A30 30 0 0 1 230 210 Z" fill="#F6EFE0" />
      <line x1="0" y1="210" x2="400" y2="210" stroke="#2B2118" strokeWidth="2" />
    </svg>
  );
}
