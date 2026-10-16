# Marquee

> Campus events, curated.

Marquee is a fast, filterable campus-event browser. It pulls every event from a live API, lets you slice by category, date, price, and seat availability, and keeps your filter state in the URL so you can share a precise shortlist with a single link.

## Features

- **Full event feed** – every fest, workshop, talk, and hack night in one place.
- **Smart filters** – category groups, quick-picks (free, today, open seats, featured), date ranges, price, and keyword search.
- **URL-synced state** – filters round-trip through the query string, so links always reproduce the exact view.
- **Featured row** – pinned spotlight cards above the main grid for high-priority events.
- **Responsive** – sidebar filters on desktop, bottom sheet on mobile.
- **Accessible** – skip-link, ARIA labels, keyboard-navigable filter chips.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Routing | React Router v6 |
| Styling | CSS Modules (vanilla CSS) |
| Data | REST API (read-only, no auth) |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle → dist/
```

### Environment variable

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE` | `https://render72.pages.dev` | API base URL |

The default points at the live data source and works out of the box without any `.env` file.

## Project structure

```
src/
  api.ts                  # fetch helpers
  components/             # Layout, EventCard, FilterBar, FilterSheet, …
  hooks/                  # useEventsData, useEventsFilters
  lib/                    # categoryColors, categoryGroups, eventHelpers
  pages/                  # Landing, Events
```

---

*Marquee is a Render72 hackathon submission.*
