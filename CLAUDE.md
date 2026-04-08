# AI Displacement Site

Public-facing web page for the AI Displacement Tracker. Hosted on Vercel, likely under a Baresquare subdomain.

## Architecture

Next.js 16 + Tailwind CSS + Recharts. Static export (`output: "export"`). No server-side logic.

Data flow: `tracker.db` (local) → `scripts/export-db.py` → `public/data/cases.json` → imported at build time.

## Updating Data

1. Run the export script from this directory:
   ```
   python3 scripts/export-db.py
   ```
   It reads `../ai-displacement-tracker/tracker.db` by default.

2. Commit the updated `public/data/cases.json`.

3. Push to GitHub. Vercel auto-deploys.

## Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main page: hero text, crisis banner, dashboard, methodology, footer |
| `src/components/Dashboard.tsx` | Client component: KPI cards, timeline chart, breakdown bars, case table, layoff events |
| `public/data/cases.json` | Exported tracker data (no names, no identifying info) |
| `scripts/export-db.py` | DB → JSON export script |

## Design

Dark theme. Accent color: `#c9a0dc` (muted purple). Crisis resources always visible at top. reportingonsuicide.org compliant.

## Related

Tracker project: `/Projects/personal/ai-displacement-tracker/`
