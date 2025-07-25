"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend
} from "recharts";
import React from "react";
import Link from "next/link";

interface AgeGenderTurnout {
  id: number;
  year: number;
  election_e: string;
  election_f: string;
  province_id: number;
  province: string;
  province_f: string;
  gender: string;
  gender_f: string;
  age_group_id: number;
  age_group: string;
  age_group_f: string;
  votes: number;
  eligible_electors: number;
  turnout_rate: number;
}

const GENDER_OPTIONS = ["All genders", "Male", "Female"];

const PROVINCE_OPTIONS = [
  "Canada", "Newfoundland and Labrador", "Prince Edward Island", "Nova Scotia", "New Brunswick", "Quebec", "Ontario", "Manitoba", "Saskatchewan", "Alberta", "British Columbia", "Yukon", "Northwest Territories", "Nunavut"
];

export default function TurnoutDashboard() {
  const [data, setData] = useState<AgeGenderTurnout[]>([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState("All genders");
  const [province, setProvince] = useState("Canada");
  // Add state for hovered tick
  const [hoveredTick, setHoveredTick] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://generational-political-turnout.onrender.com/api/age-gender-turnout")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  // Filtered data for dropdowns
  const filtered = data.filter(
    (row) =>
      (gender === "All genders" || row.gender === gender) &&
      (province === "Canada" || row.province === province)
  );

  // --- Chart 1: Bar chart - Average turnout rate (%) by age group ---
  // Exclude unwanted age groups for the bar chart
  const ageGroups = Array.from(new Set(filtered.map((d) => d.age_group)))
    .filter(
      (age) =>
        age !== "All ages" &&
        age !== "First time" &&
        age !== "Not first time"
    )
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const avgTurnoutByAge = ageGroups.map((age) => {
    const rows = filtered.filter((d) => d.age_group === age);
    const avg = rows.length ? rows.reduce((sum, d) => sum + d.turnout_rate, 0) / rows.length : 0;
    return { age_group: age, turnout_rate: +(avg * 100).toFixed(1) };
  });

  // --- Chart 2: Line chart - Turnout trend by election year with age group lines ---
  // Filter out unwanted age groups for the line chart
  const ageGroupsForLine = ageGroups.filter(
    (age) =>
      age !== "All ages" &&
      age !== "First time" &&
      age !== "Not first time"
  );
  
  // Map election_e to just the year (e.g., '2004')
  const electionYearMap: { [key: string]: string } = {};
  filtered.forEach((d) => {
    const match = d.election_e.match(/(\d{4})/);
    if (match) {
      electionYearMap[d.election_e] = match[1];
    }
  });
  
  const elections = Array.from(new Set(filtered.map((d) => d.election_e)))
    .sort((a, b) => {
      // Sort by year
      const yearA = parseInt(electionYearMap[a] || "0");
      const yearB = parseInt(electionYearMap[b] || "0");
      return yearA - yearB;
    });
  
  const electionYears = elections.map((e) => electionYearMap[e]);
  
  // Create line data with years as x-axis and age groups as lines
  const lineData = electionYears.map((year) => {
    const obj: any = { year };
    const election = elections.find(e => electionYearMap[e] === year);
    
    ageGroupsForLine.forEach((age) => {
      const row = filtered.find((d) => d.age_group === age && d.election_e === election);
      // Create shorter age group labels for legend
      let ageLabel = age;
      if (age.includes("to")) {
        const match = age.match(/(\d+)\s+to\s+(\d+)/);
        if (match) {
          ageLabel = `${match[1]}-${match[2]}`;
        }
      } else if (age.includes("and over")) {
        const match = age.match(/(\d+)\s+and over/);
        if (match) {
          ageLabel = `${match[1]}+`;
        }
      }
      obj[ageLabel] = row ? +(row.turnout_rate * 100).toFixed(1) : null;
    });
    return obj;
  });

  // Assign colors for each age group
  const ageGroupColors: { [age: string]: string } = {
    "18-24": "#dc2626", // red
    "25-34": "#f97316", // orange
    "35-44": "#eab308", // yellow
    "45-54": "#16a34a", // green
    "55-64": "#2563eb", // blue
    "65-74": "#a21caf", // purple
    "75+": "#14b8a6", // teal
  };

  // --- Chart 3: Clustered Bar - Age Group by Province (for 18-24) ---
  // Province abbreviation map
  const PROVINCE_ABBREVIATIONS: { [key: string]: string } = {
    "Newfoundland and Labrador": "NL",
    "Prince Edward Island": "PE",
    "Nova Scotia": "NS",
    "New Brunswick": "NB",
    "Quebec": "QC",
    "Ontario": "ON",
    "Manitoba": "MB",
    "Saskatchewan": "SK",
    "Alberta": "AB",
    "British Columbia": "BC",
    "Yukon": "YT",
    "Northwest Territories": "NT",
    "Nunavut": "NU",
  };
  const provinces = Array.from(new Set(filtered.map((d) => d.province))).filter((p) => p !== "Canada").sort();
  const clusteredBarData = provinces.map((prov) => {
    const row = filtered.find((d) => d.province === prov && d.age_group === "18 to 24 years");
    return {
      province: prov,
      province_abbr: PROVINCE_ABBREVIATIONS[prov] || prov,
      turnout_rate: row ? +(row.turnout_rate * 100).toFixed(1) : null,
    };
  });
  // Custom Tooltip for Clustered Bar (18–24 by province)
  const CustomProvinceBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const fullProvince = entry && entry.payload && entry.payload.province;
      return (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ color: '#000', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{fullProvince}</div>
          <div style={{ color: '#000', fontWeight: 500, fontSize: 14 }}>Turnout Rate: {entry.value}%</div>
        </div>
      );
    }
    return null;
  };

  // --- Summary Cards and Insights (use full dataset, not filtered) ---
  const VALID_AGE_GROUP = (age: string) => (
    age !== "All ages" && age !== "First time" && age !== "Not first time"
  );

  // Highest turnout: all genders only, valid age groups only
  const highest = data
    .filter(d => d.gender === "All genders" && VALID_AGE_GROUP(d.age_group))
    .reduce((max, d) => (d.turnout_rate > (max?.turnout_rate ?? -1) ? d : max), null as AgeGenderTurnout | null);

  // Lowest turnout: valid age groups only
  const lowest = data
    .filter(d => VALID_AGE_GROUP(d.age_group))
    .reduce((min, d) => (d.turnout_rate < (min?.turnout_rate ?? 2) ? d : min), null as AgeGenderTurnout | null);

  // Overall average: valid age groups only
  const validForAvg = data.filter(d => VALID_AGE_GROUP(d.age_group));
  const overallAvg = validForAvg.length ? +(validForAvg.reduce((sum, d) => sum + d.turnout_rate, 0) / validForAvg.length * 100).toFixed(1) : 0;

  // --- NEW: 2021 only total votes and eligible electors ---
  const data2021 = data.filter(d => d.year === 2021 && d.gender === "All genders" && d.province === "Canada" && VALID_AGE_GROUP(d.age_group));
  const totalVotes2021 = data2021.reduce((sum, d) => sum + (d.votes || 0), 0);
  const totalEligible2021 = data2021.reduce((sum, d) => sum + (d.eligible_electors || 0), 0);

  // Youngest/oldest group gap
  const youngest = data.filter((d) => d.age_group === "18 to 24 years");
  const oldest = data.filter((d) => d.age_group === "65 to 74 years");
  const youngestAvg = youngest.length ? youngest.reduce((sum, d) => sum + d.turnout_rate, 0) / youngest.length : 0;
  const oldestAvg = oldest.length ? oldest.reduce((sum, d) => sum + d.turnout_rate, 0) / oldest.length : 0;
  const gap = +(oldestAvg - youngestAvg) * 100;

  // Add a mapping for special province short forms for cards
  const CARD_PROVINCE_SHORT: { [key: string]: string } = {
    "Prince Edward Island": "PEI",
  };

  // --- Insights ---
  // Replace redundant highest turnout insight with largest turnout gap insight
  // Find the two age group/province pairs with the largest turnout rate difference (all genders only, valid age groups)
  const allGendersValid = data.filter(d => d.gender === "All genders" && VALID_AGE_GROUP(d.age_group));
  let maxGap = 0;
  let gapInfo = null;
  for (let i = 0; i < allGendersValid.length; i++) {
    for (let j = i + 1; j < allGendersValid.length; j++) {
      const diff = Math.abs(allGendersValid[i].turnout_rate - allGendersValid[j].turnout_rate);
      if (diff > maxGap) {
        maxGap = diff;
        gapInfo = {
          high: allGendersValid[i].turnout_rate > allGendersValid[j].turnout_rate ? allGendersValid[i] : allGendersValid[j],
          low: allGendersValid[i].turnout_rate > allGendersValid[j].turnout_rate ? allGendersValid[j] : allGendersValid[i],
          diff: diff
        };
      }
    }
  }
  const insights = [
    gapInfo ? `Largest turnout gap: ${gapInfo.high.age_group} in ${CARD_PROVINCE_SHORT[gapInfo.high.province] || gapInfo.high.province} (${(gapInfo.high.turnout_rate * 100).toFixed(1)}%) vs ${gapInfo.low.age_group} in ${CARD_PROVINCE_SHORT[gapInfo.low.province] || gapInfo.low.province} (${(gapInfo.low.turnout_rate * 100).toFixed(1)}%) — a difference of ${(gapInfo.diff * 100).toFixed(1)} percentage points.` : "",
    `Older age groups (65+) consistently have the highest turnout rates.`,
    highest ? `Highest turnout: ${highest.age_group}, ${highest.province} (${(highest.turnout_rate * 100).toFixed(1)}%)` : "",
  ];

  // Custom tick for XAxis
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const isHovered = hoveredTick === payload.value;
    return (
      <g
        onMouseEnter={() => setHoveredTick(payload.value)}
        onMouseLeave={() => setHoveredTick(null)}
        style={{ cursor: "pointer" }}
      >
        <text
          x={x}
          y={y + 10}
          textAnchor="middle"
          fontSize={14}
          fill={isHovered ? "#000" : (props.stroke || "#6b7280")}
          fontWeight={isHovered ? 700 : 400}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  // Custom Tooltip for BarChart (Average Turnout by Age Group)
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ color: '#000', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{label}</div>
          {payload.map((entry: any, i: number) => (
            <div key={i} style={{ color: '#000', fontWeight: 500, fontSize: 14 }}>
              Turnout Rate: {entry.value}%
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for LineChart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ color: '#000', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{label}</div>
          {payload.map((entry: any, i: number) => (
            <div key={i} style={{ color: entry.color, fontWeight: 500, fontSize: 14 }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: entry.color, borderRadius: '50%', marginRight: 6 }}></span>
              {entry.name}: {entry.value}%
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // --- Reusable StatCard Component (matches ImmigrationTurnoutPage) ---
  function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center border-t-4`} style={{ borderTopColor: color }}>
        <div className="text-lg text-gray-500 mb-1">{title}</div>
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col p-4 md:p-8">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-300 font-semibold group">
          <span style={{ fontSize: 20, marginRight: 6 }}>&larr;</span>
          <span className="underline-hover group-hover:underline">Back</span>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white text-center">Election Turnout Dashboard</h1>
      <section className="w-full max-w-4xl mx-auto mb-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow flex flex-col gap-3">
        <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-1">Why Does Voter Turnout Matter?</h2>
        <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
          Voter turnout is a key indicator of democratic engagement and the health of our political system. Understanding how turnout varies by age, gender, and province helps identify gaps in participation, inform outreach strategies, and ensure all voices are represented in federal elections.
        </p>
        <div className="text-base font-semibold text-gray-800 dark:text-gray-100 bg-blue-50 dark:bg-blue-900 rounded px-4 py-2 mb-2 mt-1 text-center">
          This dashboard covers Canadian federal elections from <span className="font-bold">2004 to 2021</span>.
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-2">What You'll Find on This Page</h3>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 text-base space-y-1">
          <li>Interactive charts showing turnout rates by age group, gender, and province across recent federal elections.</li>
          <li>Comparisons of turnout trends over time and between demographic groups.</li>
          <li>Key insights and summary statistics to highlight important patterns and gaps in participation.</li>
        </ul>
      </section>
      <hr className="my-8 border-t border-gray-200 dark:border-gray-700" />
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Gender</label>
          <select value={gender} onChange={e => setGender(e.target.value)} className="rounded border px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {GENDER_OPTIONS.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Province</label>
          <select value={province} onChange={e => setProvince(e.target.value)} className="rounded border px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {PROVINCE_OPTIONS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Bar Chart: Average turnout by age group (across all years) */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Average Turnout Rate by Age Group (All Years)</h2>
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
                <BarChart data={avgTurnoutByAge}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age_group" fontSize={14} />
                  <YAxis fontSize={14} tickFormatter={v => v + "%"} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="turnout_rate" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#d1d5db', marginTop: 12 }}>
            Age Group
          </div>
        </div>
        {/* Line Chart: Turnout trend by election year with age group lines */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Turnout Trend by Age Group (2004-2021)</h2>
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
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" fontSize={14} />
                  <YAxis fontSize={14} tickFormatter={v => v + "%"} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Object.keys(ageGroupColors).map((ageGroup) => (
                    <Line
                      key={ageGroup}
                      type="monotone"
                      dataKey={ageGroup}
                      stroke={ageGroupColors[ageGroup]}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#d1d5db', marginTop: 12 }}>
            Election Year
          </div>
        </div>
        {/* Clustered Bar: 18–24 by province */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 col-span-1 lg:col-span-2">
          <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Turnout for 18–24 Year Olds by Province (All Years)</h2>
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
                <BarChart data={clusteredBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="province_abbr" fontSize={14} angle={0} textAnchor="middle" interval={0} />
                  <YAxis fontSize={14} tickFormatter={v => v + "%"} />
                  <Tooltip content={<CustomProvinceBarTooltip />} />
                  <Bar dataKey="turnout_rate" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#d1d5db', marginTop: 12 }}>
            Province
          </div>
        </div>
      </section>
      {/* Summary Cards Section */}
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-6 gap-y-6 mb-10">
        <StatCard title="Highest Turnout" value={highest ? `${highest.age_group}, ${CARD_PROVINCE_SHORT[highest.province] || highest.province}` : "-"} color="#16a34a" />
        <StatCard title="Lowest Turnout" value={lowest ? `${lowest.age_group}, ${lowest.province}` : "-"} color="#dc2626" />
        <StatCard title="Overall Avg. Turnout" value={overallAvg.toFixed(1) + "%"} color="#2563eb" />
        <StatCard title="Total Votes Cast (2021)" value={totalVotes2021.toLocaleString()} color="#a21caf" />
        <StatCard title="Total Eligible Electors (2021)" value={totalEligible2021.toLocaleString()} color="#eab308" />
        <StatCard title="Turnout Gap (Youngest vs Oldest)" value={gap.toFixed(1) + "%"} color="#ec4899" />
      </section>
      {/* Data Insights Section */}
      <section className="w-full max-w-4xl mx-auto mb-12 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Data Insights</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-200">
          {insights.map((ins, i) => ins && <li key={i}>{ins}</li>)}
        </ul>
      </section>
      {/* Source Note */}
      <div className="w-full max-w-4xl mx-auto mb-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Source: <a href="https://open.canada.ca/data/en/dataset/b545fe25-5cf5-4488-9923-b5c2ebeeb8cc/resource/73586e35-290d-431c-94ba-5cf8a97c4ae5" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">Turnout by Age, Gender and Province, GE38–GE44</a>, open.canada.ca
      </div>
    </div>
  );
}