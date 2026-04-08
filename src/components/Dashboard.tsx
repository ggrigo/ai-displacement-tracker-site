"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts";
import { useState } from "react";

// Types matching the exported JSON
interface CaseRecord {
  case_id: number;
  age_range: string;
  gender: string;
  date_approximate: string | null;
  geography_country: string;
  geography_region: string;
  sector: string;
  role_type: string;
  employer: string;
  displacement_type: string;
  confidence: string;
  status: string;
}

interface StatItem {
  label: string;
  count: number;
}

interface LayoffEvent {
  event_id: number;
  company: string;
  date_announced: string;
  headcount: number;
  ai_cited: number;
  sector: string;
  geography: string;
}

interface TrackerData {
  exported_at: string;
  total_cases: number;
  total_sources: number;
  stats: {
    by_country: StatItem[];
    by_sector: StatItem[];
    by_displacement: StatItem[];
    by_confidence: StatItem[];
    by_month: StatItem[];
  };
  cases: CaseRecord[];
  layoff_events: LayoffEvent[];
}

// Build monthly timeline data from cases
function buildTimeline(cases: CaseRecord[]) {
  const monthCounts: Record<string, Record<string, number>> = {};

  cases.forEach((c) => {
    const month = (c.date_approximate || "unknown").slice(0, 7);
    if (month === "unknown") return;
    if (!monthCounts[month]) monthCounts[month] = {};
    const country = c.geography_country || "Unknown";
    monthCounts[month][country] = (monthCounts[month][country] || 0) + 1;
  });

  // Get all countries
  const countries = new Set<string>();
  Object.values(monthCounts).forEach((mc) =>
    Object.keys(mc).forEach((c) => countries.add(c))
  );

  // Fill gaps between min and max month
  const months = Object.keys(monthCounts).sort();
  if (months.length === 0) return { data: [], countries: [] };

  const allMonths: string[] = [];
  const [startY, startM] = months[0].split("-").map(Number);
  const [endY, endM] = months[months.length - 1].split("-").map(Number);
  let y = startY,
    m = startM;
  while (y < endY || (y === endY && m <= endM)) {
    allMonths.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  let cumulative = 0;
  const data = allMonths.map((month) => {
    const entry: Record<string, string | number> = {
      month,
      label:
        new Date(month + "-15").toLocaleDateString("en", {
          month: "short",
          year: "2-digit",
        }),
    };
    let monthTotal = 0;
    countries.forEach((c) => {
      const val = monthCounts[month]?.[c] || 0;
      entry[c] = val;
      monthTotal += val;
    });
    cumulative += monthTotal;
    entry.total = monthTotal;
    entry.cumulative = cumulative;
    return entry;
  });

  return { data, countries: Array.from(countries) };
}

const COUNTRY_COLORS: Record<string, string> = {
  India: "#f59e0b",
  US: "#6366f1",
  Unknown: "#64748b",
  China: "#ef4444",
  Japan: "#10b981",
  Germany: "#3b82f6",
};

function getCountryColor(country: string) {
  return COUNTRY_COLORS[country] || "#8b5cf6";
}

const confidenceColor: Record<string, string> = {
  confirmed: "#e85650",
  alleged: "#d4993a",
  contextual: "#7a7a85",
};

function formatDisplacement(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#333] bg-[#1a1a1f] px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 text-[#7a7a85]">{label}</p>
      {payload.map((p: { dataKey: string; color: string; name: string; value: number }) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard({ data }: { data: TrackerData }) {
  const [chartView, setChartView] = useState<"monthly" | "cumulative">(
    "cumulative"
  );
  const timeline = buildTimeline(data.cases);

  const confirmed = data.stats.by_confidence.find(
    (c) => c.label === "confirmed"
  )?.count || 0;
  const alleged = data.stats.by_confidence.find(
    (c) => c.label === "alleged"
  )?.count || 0;
  const contextual = data.stats.by_confidence.find(
    (c) => c.label === "contextual"
  )?.count || 0;
  const countries = data.stats.by_country.length;

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            n: data.total_cases,
            label: "Total cases",
            color: "#e8e8ec",
          },
          { n: confirmed, label: "Confirmed", color: "#e85650" },
          { n: alleged, label: "Alleged", color: "#d4993a" },
          { n: contextual, label: "Contextual", color: "#7a7a85" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-[#222228] bg-[#111115] p-5"
          >
            <div
              className="text-3xl font-bold tabular-nums"
              style={{ color: kpi.color }}
            >
              {kpi.n}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-[#7a7a85]">
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* Sub-stats row */}
      <div className="flex flex-wrap gap-6 text-sm text-[#7a7a85]">
        <span>
          <strong className="text-[#e8e8ec]">{countries}</strong>{" "}
          {countries === 1 ? "country" : "countries"}
        </span>
        <span>
          <strong className="text-[#e8e8ec]">{data.total_sources}</strong>{" "}
          sources tracked
        </span>
        <span>
          <strong className="text-[#e8e8ec]">
            {data.stats.by_sector.length}
          </strong>{" "}
          {data.stats.by_sector.length === 1 ? "sector" : "sectors"}
        </span>
      </div>

      {/* Timeline chart */}
      <div className="rounded-xl border border-[#222228] bg-[#111115] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#7a7a85]">
            {chartView === "monthly"
              ? "Monthly cases by country"
              : "Cumulative cases"}
          </h2>
          <div className="flex gap-1">
            {(["monthly", "cumulative"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setChartView(v)}
                className="rounded px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background: chartView === v ? "#c9a0dc" : "#1a1a1f",
                  color: chartView === v ? "#0a0a0c" : "#7a7a85",
                  border:
                    chartView === v
                      ? "1px solid #c9a0dc"
                      : "1px solid #222228",
                }}
              >
                {v === "monthly" ? "Monthly" : "Cumulative"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          {chartView === "monthly" ? (
            <BarChart data={timeline.data} barSize={16}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ffffff08"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#7a7a85", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#7a7a85", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={20}
              />
              <Tooltip content={<CustomTooltip />} />
              {timeline.countries.map((country, i) => (
                <Bar
                  key={country}
                  dataKey={country}
                  stackId="a"
                  fill={getCountryColor(country)}
                  name={country}
                  radius={
                    i === timeline.countries.length - 1 ? [3, 3, 0, 0] : undefined
                  }
                />
              ))}
            </BarChart>
          ) : (
            <ComposedChart data={timeline.data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ffffff08"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#7a7a85", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#7a7a85", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={20}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                fill="rgba(201, 160, 220, 0.1)"
                stroke="#c9a0dc"
                strokeWidth={2}
                dot={{ r: 3, fill: "#c9a0dc" }}
                name="Cumulative cases"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Breakdowns: country + displacement type side by side */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#222228] bg-[#111115] p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#7a7a85]">
            By Country
          </h3>
          <div className="space-y-3">
            {data.stats.by_country.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-[#9a9aa5]">{item.label}</span>
                  <span className="font-bold" style={{ color: getCountryColor(item.label) }}>
                    {item.count}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-[#1a1a1f]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.count / data.total_cases) * 100}%`,
                      background: getCountryColor(item.label),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#222228] bg-[#111115] p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#7a7a85]">
            By Displacement Type
          </h3>
          <div className="space-y-3">
            {data.stats.by_displacement.map((item, i) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-[#9a9aa5]">
                    {formatDisplacement(item.label)}
                  </span>
                  <span
                    className="font-bold"
                    style={{
                      color: ["#6366f1", "#f59e0b", "#10b981", "#ef4444"][i % 4],
                    }}
                  >
                    {item.count}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-[#1a1a1f]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.count / data.total_cases) * 100}%`,
                      background: ["#6366f1", "#f59e0b", "#10b981", "#ef4444"][
                        i % 4
                      ],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cases table */}
      <div className="rounded-xl border border-[#222228] bg-[#111115] p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#7a7a85]">
          Cases (Anonymized)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-[#222228] text-left text-[#7a7a85]">
                <th className="py-2 pr-3 font-semibold">#</th>
                <th className="py-2 pr-3 font-semibold">Date</th>
                <th className="py-2 pr-3 font-semibold">Country</th>
                <th className="py-2 pr-3 font-semibold">Region</th>
                <th className="py-2 pr-3 font-semibold">Sector</th>
                <th className="py-2 pr-3 font-semibold">Displacement</th>
                <th className="py-2 pr-3 font-semibold">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {data.cases.map((c) => (
                <tr
                  key={c.case_id}
                  className="border-b border-[#1a1a1f] hover:bg-[#1a1a1f]"
                >
                  <td className="py-2 pr-3 tabular-nums text-[#4a4a55]">
                    {c.case_id}
                  </td>
                  <td className="py-2 pr-3 text-[#9a9aa5]">
                    {c.date_approximate || "\u2014"}
                  </td>
                  <td className="py-2 pr-3 text-[#e8e8ec]">
                    {c.geography_country}
                  </td>
                  <td className="py-2 pr-3 text-[#9a9aa5]">
                    {c.geography_region || "\u2014"}
                  </td>
                  <td className="py-2 pr-3 text-[#9a9aa5]">
                    {(c.sector || "\u2014").replace(/_/g, " ")}
                  </td>
                  <td className="py-2 pr-3 text-[#9a9aa5]">
                    {formatDisplacement(c.displacement_type || "\u2014")}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: `${confidenceColor[c.confidence] || "#7a7a85"}22`,
                        color: confidenceColor[c.confidence] || "#7a7a85",
                      }}
                    >
                      {c.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layoff events cross-reference */}
      {data.layoff_events.length > 0 && (
        <div className="rounded-xl border border-[#222228] bg-[#111115] p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#7a7a85]">
            AI-Driven Layoff Events (Cross-Reference)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-[#222228] text-left text-[#7a7a85]">
                  <th className="py-2 pr-3 font-semibold">Company</th>
                  <th className="py-2 pr-3 font-semibold">Headcount</th>
                  <th className="py-2 pr-3 font-semibold">AI Cited</th>
                  <th className="py-2 pr-3 font-semibold">Geography</th>
                  <th className="py-2 pr-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.layoff_events.map((e) => (
                  <tr
                    key={e.event_id}
                    className="border-b border-[#1a1a1f] hover:bg-[#1a1a1f]"
                  >
                    <td className="py-2 pr-3 text-[#e8e8ec]">{e.company}</td>
                    <td className="py-2 pr-3 tabular-nums text-[#9a9aa5]">
                      {e.headcount ? e.headcount.toLocaleString() : "\u2014"}
                    </td>
                    <td className="py-2 pr-3 text-[#9a9aa5]">
                      {e.ai_cited ? "Yes" : "No"}
                    </td>
                    <td className="py-2 pr-3 text-[#9a9aa5]">
                      {e.geography || "\u2014"}
                    </td>
                    <td className="py-2 pr-3 text-[#9a9aa5]">
                      {e.date_announced || "\u2014"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
