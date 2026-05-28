# Upstart · Capital Partner Portal

Whitelabel embedded analytics demo built on ThoughtSpot, tailored for Upstart's capital-supply partners.

**Stack:** Vite + React + TypeScript + `@thoughtspot/visual-embed-sdk`.

## Local dev

```bash
npm install
npm run dev
```

Runs on **http://localhost:8081**.

## Routes

| Path | What |
|------|------|
| `/` | Home — hero, KPI tiles, capability cards |
| `/dashboard` | Default Lending Performance liveboard |
| `/dashboard/:liveboardId` | Any liveboard, opened by ID |
| `/ai-analytics` | Insights AI (Spotter) with view-tuned starter prompts |
| `/my-reports` | Live, API-driven list of liveboards |

## Demo features

- **Capital partner switcher** (Internal Demo / Goldman Sachs / Apollo / Marlette) — drives `runtimeFilters` against `Current Creditor Name`, `Originating Lender Name`, and `Product Type` for live row-level security
- **View switcher** (Executive / Capital Markets / Operations) — applies a date range filter on `Origination Date` and swaps starter prompts
- **Whitelabel theming** — navy/teal/orange via TS CSS variables, "ThoughtSpot" strings replaced with "Upstart Insights"
- **REST-driven My Reports** — pulls liveboard list from `/api/rest/2.0/metadata/search`
- **Direct prompt injection into Spotter** via `HostEvent.SpotterSearch` — no remount

## ThoughtSpot setup required

Set the values in `src/lib/thoughtspot.ts`:

- `TS_HOST` — Upstart cluster URL
- `UPSTART_LIVEBOARD_ID` — ID of the "💸 Upstart Lending Performance" liveboard
- `UPSTART_MODEL_ID` — defaulted to `LoansWithApplications-69bbf7d3`

In the TS cluster → Develop → Customizations → Security settings:

1. **CORS whitelisted domains** — add `http://localhost:8081` (and your Vercel domain).
2. **CSP visual embed hosts** — add `http://localhost:8081` (and Vercel domain).

Sign in to the TS cluster in the same browser before loading the portal.
