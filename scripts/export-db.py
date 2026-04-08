#!/usr/bin/env python3
"""
Export tracker.db → public/data/cases.json

Run from the ai-displacement-site directory:
  python3 scripts/export-db.py

Or specify the DB path:
  python3 scripts/export-db.py /path/to/tracker.db
"""

import sqlite3
import json
import sys
import os
from datetime import datetime
from pathlib import Path

# Resolve paths
script_dir = Path(__file__).parent
site_root = script_dir.parent
default_db = site_root.parent / "ai-displacement-tracker" / "tracker.db"

db_path = Path(sys.argv[1]) if len(sys.argv) > 1 else default_db

if not db_path.exists():
    print(f"Error: Database not found at {db_path}")
    print(f"Usage: python3 {sys.argv[0]} [path/to/tracker.db]")
    sys.exit(1)

conn = sqlite3.connect(str(db_path))
conn.row_factory = sqlite3.Row

# Public cases — no names, no identifying info
cases = []
for r in conn.execute('''
    SELECT case_id, age_range, gender, date_of_death, date_approximate, date_precision,
           geography_country, geography_region, sector, role_type, employer,
           displacement_type, confidence, status,
           had_support_network, had_financial_safety_net, time_since_displacement
    FROM cases WHERE status IN ('confirmed', 'reviewed')
    ORDER BY date_approximate DESC, case_id
''').fetchall():
    cases.append(dict(r))

# Sources per case
sources = []
for r in conn.execute('''
    SELECT source_id, case_id, url, source_type, language, title, publication, date_published
    FROM sources ORDER BY case_id, source_id
''').fetchall():
    sources.append(dict(r))

# Layoff events
layoffs = []
for r in conn.execute('SELECT * FROM layoff_events ORDER BY date_announced DESC').fetchall():
    d = dict(r)
    d.pop('source_url', None)  # Don't expose in public JSON
    d.pop('notes', None)
    layoffs.append(d)

# Build stats
total = len(cases)

def count_by(field):
    counts = {}
    for c in cases:
        val = c.get(field) or 'unknown'
        counts[val] = counts.get(val, 0) + 1
    return sorted([{'label': k, 'count': v} for k, v in counts.items()], key=lambda x: -x['count'])

by_month = {}
for c in cases:
    month = (c['date_approximate'] or 'unknown')[:7]
    by_month[month] = by_month.get(month, 0) + 1

data = {
    'exported_at': datetime.now().strftime('%Y-%m-%d %H:%M'),
    'total_cases': total,
    'total_sources': len(sources),
    'stats': {
        'by_country': count_by('geography_country'),
        'by_sector': count_by('sector'),
        'by_displacement': count_by('displacement_type'),
        'by_confidence': count_by('confidence'),
        'by_month': sorted([{'label': k, 'count': v} for k, v in by_month.items()], key=lambda x: x['label']),
    },
    'cases': cases,
    'sources': sources,
    'layoff_events': layoffs,
}

# Write output
output_path = site_root / "public" / "data" / "cases.json"
output_path.parent.mkdir(parents=True, exist_ok=True)

with open(output_path, 'w') as f:
    json.dump(data, f, indent=2, default=str)

print(f"Exported {total} cases, {len(sources)} sources, {len(layoffs)} layoff events")
print(f"Output: {output_path}")
