"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, Cell
} from "recharts";
import React from "react";

// --- Data Imports ---
// Since the file exports constants, we need to copy the data here or adjust the import if using ES modules
const countryBirthData = [
  { country: "Western/Northern Europe", both: 76.6, men: 78.5, women: 74.7 },
  { country: "US, UK, Ireland, AUS, NZ", both: 75.2, men: 73.8, women: 76.4 },
  { country: "Southern Asia", both: 68.1, men: 68.2, women: 68.1 },
  { country: "Southern Europe", both: 67.8, men: 69.2, women: 66.4 },
  { country: "Canada", both: 67.1, men: 65.9, women: 68.3 },
  { country: "Eastern Europe", both: 62.8, men: 62.6, women: 63.0 },
  { country: "Africa", both: 62.2, men: 67.2, women: 56.4 },
  { country: "Caribbean/Central/South America", both: 61.0, men: 60.0, women: 61.8 },
  { country: "Southeast Asia", both: 58.5, men: 59.0, women: 58.2 },
  { country: "Other", both: 57.2, men: 58.9, women: 55.8 },
  { country: "Eastern Asia", both: 54.1, men: 53.5, women: 54.6 },
  { country: "West Central Asia & Middle East", both: 53.4, men: 52.7, women: 54.3 },
];
const immigrantStatusGender = [
  { status: "Canadian-born", men: 65.9, women: 68.3, both: 67.1 },
  { status: "Established Immigrant", men: 66.8, women: 65.9, both: 66.3 },
  { status: "Recent Immigrant", men: 51.2, women: 51.0, both: 51.1 },
];
const immigrantTimeSeries = [
  { year: 2011, recent: 56, established: 71, born: 70 },
  { year: 2015, recent: 70, established: 76, born: 78 },
  { year: 2019, recent: 72, established: 75, born: 78 },
  { year: 2021, recent: 66, established: 71, born: 77 },
];

const GENDER_OPTIONS = ["All genders", "Male", "Female"];
const STATUS_COLORS = {
  "Canadian-born": "#2563eb", // blue
  "Established Immigrant": "#a21caf", // purple
  "Recent Immigrant": "#14b8a6", // teal
};
const COUNTRY_COLORS = ["#2563eb", "#14b8a6", "#a21caf"];
const BAR_COLOR: Record<string, string> = {
  "All genders": "#16a34a", // green
  "Male": "#2563eb",       // blue
  "Female": "#ec4899",     // pink
};

export default function ImmigrationTurnoutPage() {
  const [gender, setGender] = useState("All genders");

  // --- Chart 1: Grouped Bar Chart by Country of Birth & Gender ---
  const barData = countryBirthData.map((row) => {
    if (gender === "All genders") return { country: row.country, value: row.both };
    if (gender === "Male") return { country: row.country, value: row.men };
    if (gender === "Female") return { country: row.country, value: row.women };
    return { country: row.country, value: row.both };
  });

  // --- Chart 2: Immigrant Status by Gender (Grouped Bar) ---
  const groupedBarData = immigrantStatusGender;
  const GENDER_BAR_COLORS = { men: "#2563eb", women: "#ec4899" };
  const CustomStatusBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const both = groupedBarData.find((row) => row.status === label)?.both;
      return (
        <div className="bg-white border border-gray-200 rounded p-2 shadow text-xs">
          <div className="font-bold mb-1" style={{ color: '#000' }}>{label}</div>
          {payload.map((entry: any, i: number) => (
            <div key={i} style={{ color: entry.color }}>{entry.name}: {entry.value}%</div>
          ))}
          {both !== undefined && (
            <div className="mt-1 text-gray-600">Both sexes: {both}%</div>
          )}
        </div>
      );
    }
    return null;
  };

  // --- Chart 3: Line Chart (Trends Over Time) ---
  // Already formatted

  // --- Summary Stats ---
  // Highest turnout group (country/gender)
  let highest = { group: "", value: -1 };
  let lowest = { group: "", value: 101 };
  countryBirthData.forEach((row) => {
    [
      { label: `${row.country} (All)`, value: row.both },
      { label: `${row.country} (Men)`, value: row.men },
      { label: `${row.country} (Women)`, value: row.women },
    ].forEach((g) => {
      if (g.value > highest.value) highest = { group: g.label, value: g.value };
      if (g.value < lowest.value) lowest = { group: g.label, value: g.value };
    });
  });
  // Gender gap (largest diff in country)
  let maxGap = 0;
  let gapInfo: { country: string; men: number; women: number; gap: number } = { country: "-", men: 0, women: 0, gap: 0 };
  countryBirthData.forEach((row) => {
    const gap = Math.abs(row.men - row.women);
    if (gap > maxGap) {
      maxGap = gap;
      gapInfo = { country: row.country, men: row.men, women: row.women, gap };
    }
  });
  // Consistency: group with smallest range
  let minRange = 100;
  let consistent = null;
  countryBirthData.forEach((row) => {
    const vals = [row.both, row.men, row.women];
    const range = Math.max(...vals) - Math.min(...vals);
    if (range < minRange) {
      minRange = range;
      consistent = row.country;
    }
  });
  // Highest immigrant status
  let highestStatus = immigrantStatusGender.reduce((max, row) => {
    const maxVal = Math.max(row.men, row.women);
    return maxVal > max.value ? { group: `${row.status}`, value: maxVal } : max;
  }, { group: "", value: -1 });
  // Lowest immigrant status
  let lowestStatus = immigrantStatusGender.reduce((min, row) => {
    const minVal = Math.min(row.men, row.women);
    return minVal < min.value ? { group: `${row.status}`, value: minVal } : min;
  }, { group: "", value: 101 });

  // --- Key Insights ---
  const insights = [
    "Canadian-born citizens have the most consistent turnout over time.",
    "Recent immigrants saw a big jump in turnout in 2015.",
    "Turnout among women is generally higher than men across most groups.",
    `The largest gender gap in turnout is in Africa: ${gapInfo.gap.toFixed(1)} percentage points (Men: ${gapInfo.men}%, Women: ${gapInfo.women}%)`,
    `Highest turnout group: ${highest.group} (${highest.value}%)`,
    `Lowest turnout group: ${lowest.group} (${lowest.value}%)`,
  ];

  // --- Reusable Card Component ---
  function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center border-t-4`} style={{ borderTopColor: color }}>
        <div className="text-lg text-gray-500 mb-1">{title}</div>
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      </div>
    );
  }

  // --- Custom Tooltip for BarChart ---
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded p-2 shadow text-xs">
          <div className="font-bold mb-1" style={{ color: '#000' }}>{label}</div>
          {payload.map((entry: any, i: number) => (
            <div key={i} style={{ color: entry.color }}>Turnout: {entry.value}%</div>
          ))}
        </div>
      );
    }
    return null;
  };

  // --- Custom Tooltip for LineChart ---
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded p-2 shadow text-xs">
          <div className="font-bold mb-1">{label}</div>
          {payload.map((entry: any, i: number) => (
            <div key={i} style={{ color: entry.color }}>{entry.name}: {entry.value}%</div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom XAxis tick for Chart 1: special label for Western/Northern Europe and bold/white for Canada
  const CustomCountryTick = (props: any) => {
    const { x, y, payload } = props;
    let label = payload.value;
    let style: React.CSSProperties = { fontSize: 14, fill: '#6b7280', fontWeight: 400 };
    if (label === 'Western/Northern Europe') label = 'West/North EU';
    if (payload.value === 'Canada') {
      style = { ...style, fontWeight: 700, fill: '#fff' };
    }
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          transform="rotate(-18)"
          style={style}
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white text-center">Immigrant Status & Voter Turnout in Canada</h1>
      <section className="w-full max-w-4xl mx-auto mb-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow flex flex-col gap-3">
        <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-1">Why Immigration Status & Voter Turnout Matter</h2>
        <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
          Understanding how voter turnout varies by immigrant status and country of birth helps identify participation gaps, inform outreach, and ensure all voices are represented in Canadian democracy. This page explores turnout by gender, status, and origin, and how these patterns have changed over time.
        </p>
        <div className="mt-2 mb-2">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-1">Terminology</h4>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 text-base space-y-1">
            <li><span className="font-semibold">Recent Immigrant:</span> A person who immigrated to Canada within the last 10 years and has become a Canadian citizen.</li>
            <li><span className="font-semibold">Established Immigrant:</span> A person who immigrated to Canada more than 10 years ago and is a Canadian citizen.</li>
            <li><span className="font-semibold">Canadian-born:</span> A person born in Canada, automatically a Canadian citizen.</li>
          </ul>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
          <span className="font-semibold">Note:</span> This dashboard uses <span className="font-semibold">survey-based voter turnout data from Statistics Canada (StatsCan)</span>. These figures are based on self-reported survey data and may overestimate actual turnout. They are useful for comparing trends between groups.
        </p>
        <div className="text-base font-semibold text-gray-800 dark:text-gray-100 bg-blue-50 dark:bg-blue-900 rounded px-4 py-2 mb-2 mt-1 text-center">
          Data covers federal elections from <span className="font-bold">2011 to 2021</span>.
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-2">What You'll Find on This Page</h3>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 text-base space-y-1">
          <li>Turnout rates by country of birth and gender (2011).</li>
          <li>Comparisons of turnout by immigrant status and gender.</li>
          <li>Trends in turnout by status over the last decade.</li>
          <li>Key insights and summary statistics highlighting important patterns.</li>
        </ul>
      </section>
      {/* Chart 1: Grouped Bar Chart by Country of Birth & Gender */}
      <div className="w-full max-w-6xl mx-auto mb-10">
        <div className="flex flex-wrap gap-4 mb-4 items-end">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex-1">Voter Turnout by Country of Birth & Gender (2011)</h2>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)} className="rounded border px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              {GENDER_OPTIONS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <div style={{ display: 'flex', width: '100%' }}>
            <div style={{
              writingMode: 'vertical-rl',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 18,
              color: '#d1d5db',
              marginRight: 16,
              minWidth: 40,
              height: 360,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(180deg)',
            }}>
              Turnout Rate (%)
            </div>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={barData} margin={{ top: 24, right: 24, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" fontSize={14} angle={-18} textAnchor="end" interval={0} height={70} tick={<CustomCountryTick />} />
                  <YAxis fontSize={14} tickFormatter={v => v + "%"} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, idx) => (
                      <Cell key={idx} fill={BAR_COLOR[gender] || "#2563eb"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#d1d5db', marginTop: 12 }}>
            Country/Region of Birth
          </div>
        </div>
      </div>
      {/* Chart 2: Grouped Bar Chart by Immigrant Status & Gender */}
      <div className="w-full max-w-6xl mx-auto mb-10">
        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Voter Turnout by Immigrant Status & Gender (2011)</h2>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <div style={{ display: 'flex', width: '100%' }}>
            <div style={{
              writingMode: 'vertical-rl',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 18,
              color: '#d1d5db',
              marginRight: 16,
              minWidth: 40,
              height: 320,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(180deg)',
            }}>
              Turnout Rate (%)
            </div>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={groupedBarData}
                  margin={{ top: 24, right: 24, left: 0, bottom: 24 }}
                  barCategoryGap={32}
                  barGap={0}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" fontSize={14} />
                  <YAxis fontSize={14} tickFormatter={v => v + "%"} domain={[0, 100]} />
                  <Tooltip content={<CustomStatusBarTooltip />} />
                  <Legend />
                  <Bar dataKey="men" name="Men" fill={GENDER_BAR_COLORS.men} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="women" name="Women" fill={GENDER_BAR_COLORS.women} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#d1d5db', marginTop: 12 }}>
            Immigrant Status
          </div>
        </div>
      </div>
      {/* Chart 3: Line Chart (Trends Over Time) */}
      <div className="w-full max-w-6xl mx-auto mb-10">
        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Immigrant Status Turnout Over Time (2011–2021)</h2>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <div style={{ display: 'flex', width: '100%' }}>
            <div style={{
              writingMode: 'vertical-rl',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 18,
              color: '#d1d5db',
              marginRight: 16,
              minWidth: 40,
              height: 320,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(180deg)',
            }}>
              Turnout Rate (%)
            </div>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={immigrantTimeSeries} margin={{ top: 24, right: 24, left: 0, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" fontSize={14} />
                  <YAxis fontSize={14} tickFormatter={v => v + "%"} domain={[0, 100]} />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="born" name="Canadian-born" stroke="#2563eb" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="established" name="Established Immigrant" stroke="#a21caf" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="recent" name="Recent Immigrant" stroke="#14b8a6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#d1d5db', marginTop: 12 }}>
            Year
          </div>
        </div>
      </div>
      {/* Summary Stat Cards */}
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-6 gap-y-6 mb-10">
        <StatCard title="Highest Turnout Group" value={`${highest.group} (${highest.value}%)`} color="#16a34a" />
        <StatCard title="Lowest Turnout Group" value={`${lowest.group} (${lowest.value}%)`} color="#dc2626" />
        <StatCard title="Largest Gender Gap" value={`${gapInfo.country} (${gapInfo.gap.toFixed(1)}%)`} color="#f59e42" />
        <StatCard title="Most Consistent Group (by Gender)" value={consistent || "-"} color="#2563eb" />
        <StatCard title="Highest Status" value="Canadian-born (67.1%)" color="#a21caf" />
        <StatCard title="Lowest Status" value="Recent Immigrant (51.1%)" color="#14b8a6" />
      </section>
      {/* Key Insights Section */}
      <section className="w-full max-w-4xl mx-auto mb-12 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Key Insights</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-200">
          {insights.map((ins, i) => ins && <li key={i}>{ins}</li>)}
        </ul>
      </section>
      {/* Source Note */}
      <div className="w-full max-w-4xl mx-auto mb-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Source: Voting rates by immigrant status and country/region of birth, and Voter turnout rates by age group, province and immigrant status, Statistics Canada
      </div>
    </div>
  );
}