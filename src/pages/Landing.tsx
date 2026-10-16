import { Link } from "react-router-dom";
import {
  EmptyApiPanel,
  ErrorPanel,
  EventsGridSkeleton,
} from "../components/ApiStates";
import { FeaturedRow } from "../components/FeaturedRow";
import { HeroStatsStrip } from "../components/HeroStatsStrip";
import { Marquee } from "../components/Marquee";
import { PageMeta } from "../components/PageMeta";
import { Sunburst } from "../components/Sunburst";
import { uniqueCategories } from "../lib/categoryColors";
import { useEventsData } from "../hooks/useEventsData";
import styles from "./Landing.module.css";

const HIGHLIGHTS = [
  {
    title: "One lineup",
    body: "Every fest, workshop, and hack night in a single scannable feed.",
  },
  {
    title: "Shareable filters",
    body: "Send a link with your exact search — no screenshot gymnastics.",
  },
  {
    title: "Seats in sight",
    body: "See what's filling fast before registration slams shut.",
  },
];

export default function Landing() {
  const { state, retry } = useEventsData();
  const featured =
    state.status === "ok" ? state.events.filter((e) => e.is_featured).slice(0, 6) : [];
  const categories =
    state.status === "ok" ? uniqueCategories(state.events) : ["Tech", "Culture", "Sports", "Workshops"];

  const statsProps =
    state.status === "loading"
      ? ({ status: "loading" } as const)
      : state.status === "error"
        ? ({ status: "error" } as const)
        : ({ status: "ok", events: state.events } as const);

  return (
    <>
      <PageMeta
        title="Render72 — Campus Events"
        description="Your college events hub: discover featured fests, workshops, and registrations in one loud, friendly place."
      />
      <div className={styles.heroWrap}>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroCopy}>
            <h1 id="hero-heading" className={`${styles.headline} reveal`}>
              Campus life, <span className={styles.highlight}>curated</span>
            </h1>
            <p className={`${styles.sub} reveal reveal-delay-1`}>
              Render72 rounds up every event on campus — browse the lineup and jump straight to what
              matters.
            </p>
            <Link to="/events" className={`${styles.cta} reveal reveal-delay-2`}>
              See all events
            </Link>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">
            <svg
              className={`${styles.star} ${styles.starOne} twinkle`}
              viewBox="0 0 24 24"
              width="22"
              height="22"
            >
              <polygon
                fill="#E2A93B"
                stroke="#2B2118"
                strokeWidth="1"
                points="12,2 14.5,9 22,9 16,13.5 18,21 12,16.5 6,21 8,13.5 2,9 9.5,9"
              />
            </svg>
            <svg
              className={`${styles.star} ${styles.starTwo} twinkle twinkle-delay`}
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <polygon
                fill="#E2A93B"
                stroke="#2B2118"
                strokeWidth="1"
                points="12,2 14.5,9 22,9 16,13.5 18,21 12,16.5 6,21 8,13.5 2,9 9.5,9"
              />
            </svg>
            <svg
              className={`${styles.star} ${styles.starThree} twinkle`}
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <polygon
                fill="#E2A93B"
                stroke="#2B2118"
                strokeWidth="1"
                points="12,2 14.5,9 22,9 16,13.5 18,21 12,16.5 6,21 8,13.5 2,9 9.5,9"
              />
            </svg>
            <Sunburst />
          </div>
        </section>

        <HeroStatsStrip {...statsProps} />

        <Marquee items={categories} />
      </div>

      <section className={styles.featuredBlock} aria-labelledby="home-featured">
        <h2 id="home-featured" className={`${styles.sectionTitle} reveal`}>
          Featured
        </h2>
        {state.status === "loading" && <EventsGridSkeleton />}
        {state.status === "error" && (
          <ErrorPanel error={state.error} onRetry={() => void retry()} />
        )}
        {state.status === "ok" && state.events.length === 0 && <EmptyApiPanel />}
        {state.status === "ok" && state.events.length > 0 && (
          <>
            {featured.length > 0 ? (
              <FeaturedRow events={featured} priorityImages showHeading={false} />
            ) : (
              <p className={styles.noFeatured}>No featured flags today — the full list still slaps.</p>
            )}
            <p className={styles.moreLinkWrap}>
              <Link to="/events" className={styles.moreLink}>
                Browse all {state.events.length} events →
              </Link>
            </p>
          </>
        )}
      </section>

      <section className={styles.highlights} aria-labelledby="highlights-heading">
        <h2 id="highlights-heading" className={`${styles.sectionTitle} reveal`}>
          Why Render72?
        </h2>
        <ul className={`${styles.highlightGrid} reveal-stagger`}>
          {HIGHLIGHTS.map((h) => (
            <li key={h.title} className={styles.highlightCard}>
              <h3 className={styles.highlightTitle}>{h.title}</h3>
              <p>{h.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
