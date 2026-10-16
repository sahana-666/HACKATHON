import { useEffect, useRef, type ReactNode } from "react";
import styles from "./FilterSheet.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onClear: () => void;
  resultCount: number;
  children: ReactNode;
};

/**
 * Mobile bottom sheet for filters.
 * - Focus is trapped inside while open
 * - Esc closes
 * - Scroll locked on body while open
 */
export function FilterSheet({ open, onClose, onClear, resultCount, children }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Move focus into the sheet
      closeRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Esc to close + focus trap
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const sheet = sheetRef.current;
        if (!sheet) return;
        const focusable = sheet.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Clicking the backdrop closes the sheet
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
      onClick={handleBackdropClick}
      aria-hidden={!open}
    >
      <div
        ref={sheetRef}
        id="filter-sheet"
        className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter events"
      >
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.drag} aria-hidden="true" />
          <h2 className={styles.title}>Filters</h2>
          <button
            ref={closeRef}
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close filters"
          >
            ×
          </button>
        </div>

        {/* Scrollable filter content */}
        <div className={styles.body}>{children}</div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.clearBtn} onClick={onClear}>
            Clear all
          </button>
          <button type="button" className={styles.showBtn} onClick={onClose}>
            Show {resultCount} result{resultCount !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
