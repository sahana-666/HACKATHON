import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEventsData } from "../hooks/useEventsData";
import styles from "./Layout.module.css";

type Props = { children: ReactNode };

/* Small inline star SVG used in the wordmark */
function StarIcon() {
  return (
    <svg
      className={styles.logoStar}
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      <polygon
        points="8,1 9.5,6 15,6 10.5,9.5 12,15 8,11.5 4,15 5.5,9.5 1,6 6.5,6"
        fill="currentColor"
      />
    </svg>
  );
}

/* Search magnifier icon */
function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8.5" cy="8.5" r="5.5" />
      <line x1="13" y1="13" x2="18" y2="18" />
    </svg>
  );
}

/* Hamburger icon */
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      {open ? (
        /* × close */
        <>
          <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="3" x2="3" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        /* ≡ menu */
        <>
          <line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="2" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function Layout({ children }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useEventsData();

  /* Compute count for announcement strip */
  const eventCount = state.status === "ok" ? state.events.length : null;

  /* Sticky scroll-shadow */
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Mobile menu */
  const [menuOpen, setMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const navPanelRef = useRef<HTMLDivElement>(null);

  /* Close on route change */
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  /* Esc to close */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  /* Navigate to /events and focus search input */
  const handleSearchClick = () => {
    navigate("/events");
    /* Defer focus until after navigation renders */
    setTimeout(() => {
      const input = document.getElementById("sidebar-search") as HTMLInputElement | null
        ?? document.getElementById("mobile-search") as HTMLInputElement | null;
      input?.focus();
    }, 80);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/events", label: "All events" },
    { to: "/#home-featured", label: "Featured", external: true },
  ];

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>

      {/* Intersection sentinel — sits just above the header */}
      <div ref={sentinelRef} aria-hidden="true" style={{ position: "absolute", top: 0, height: 1 }} />

      {/* ── Announcement strip ─────────────────────────────────────── */}
      {eventCount !== null && (
        <div className={styles.strip} role="status" aria-live="polite">
          <span>
            <strong>{eventCount}</strong> events across campus this month —{" "}
            <Link to="/events" className={styles.stripLink}>browse the lineup</Link>
          </span>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
        {/* Wordmark */}
        <Link to="/" className={styles.logo} aria-label="Marquee home">
          <StarIcon />
          Marque<span className={styles.logoAccent}>e</span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Main navigation">
          {navLinks.map(({ to, label, external }) =>
            external ? (
              <a
                key={label}
                href={to}
                className={styles.navLink}
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                to={to}
                className={`${styles.navLink} ${pathname === to ? styles.navActive : ""}`}
                aria-current={pathname === to ? "page" : undefined}
              >
                {label}
              </Link>
            )
          )}
        </nav>

        {/* Right-side actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.searchBtn}
            aria-label="Search events"
            onClick={handleSearchClick}
          >
            <SearchIcon />
          </button>
          <Link to="/events" className={styles.browseBtn}>
            Browse events
          </Link>
          {/* Hamburger — mobile only */}
          <button
            ref={hamburgerRef}
            type="button"
            className={styles.hamburger}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </header>

      {/* ── Mobile nav dropdown ───────────────────────────────────── */}
      {menuOpen && (
        <div
          id="mobile-nav-panel"
          ref={navPanelRef}
          className={styles.mobilePanel}
          role="dialog"
          aria-label="Navigation menu"
        >
          {navLinks.map(({ to, label, external }) =>
            external ? (
              <a
                key={label}
                href={to}
                className={styles.mobilePanelLink}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                to={to}
                className={`${styles.mobilePanelLink} ${pathname === to ? styles.mobilePanelActive : ""}`}
                aria-current={pathname === to ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            )
          )}
          <Link
            to="/events"
            className={styles.mobilePanelBrowse}
            onClick={() => setMenuOpen(false)}
          >
            Browse events →
          </Link>
        </div>
      )}

      <main id="main">{children}</main>

      <footer className={styles.footer}>
        <p className={styles.footerTag}>© 2026 Marquee. Campus events, curated.</p>
      </footer>
    </>
  );
}
