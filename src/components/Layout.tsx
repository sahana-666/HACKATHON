import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Layout.module.css";

type Props = { children: ReactNode };

export function Layout({ children }: Props) {
  const { pathname } = useLocation();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          Marque<span className={styles.logoAccent}>e</span>
        </Link>
        <nav className={styles.nav} aria-label="Main">
          <Link
            to="/"
            className={pathname === "/" ? styles.navActive : undefined}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Home
          </Link>
          <Link
            to="/events"
            className={pathname === "/events" ? styles.navActive : undefined}
            aria-current={pathname === "/events" ? "page" : undefined}
          >
            All events
          </Link>
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className={styles.footer}>
        <p className={styles.footerTag}>© 2026 Marquee. Campus events, curated.</p>
      </footer>
    </>
  );
}
