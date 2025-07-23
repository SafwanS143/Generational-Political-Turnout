"use client";
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LeafletEvent } from "leaflet";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useMap } from "react-leaflet";
import Link from "next/link";

interface Institution {
  latitude: number;
  longitude: number;
  Province: string;
  geocode_status?: string;
  [key: string]: any;
}

export default function MapView() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  // Remove mapRef, use useMap in child
  // Refs for top 10 marker popups
  const top10MarkerRefs = useRef<(L.Marker | null)[]>([]);

  useEffect(() => {
    fetch("https://generational-political-turnout.onrender.com/api/voter-turnout")
      .then((res) => res.json())
      .then((data: any[]) => {
        setInstitutions(
          data.filter(
            (i) =>
              i.latitude &&
              i.longitude &&
              (!i.geocode_status || i.geocode_status === "OK")
          ).map((i) => ({
            ...i,
            latitude: Number(i.latitude),
            longitude: Number(i.longitude),
          }))
        );
        setLoading(false);
      });
  }, []);

  // Get top 10 by votes
  const top10 = [...institutions]
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, 10);

  const customMarker = new L.Icon({
    iconUrl: "marker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  // MapEffects: handles centering/zooming and popup opening
  function MapEffects({ selectedIdx, top10, top10MarkerRefs }: { selectedIdx: number | null, top10: Institution[], top10MarkerRefs: React.MutableRefObject<(L.Marker | null)[]> }) {
    const map = useMap();
    useEffect(() => {
      if (selectedIdx !== null && top10[selectedIdx]) {
        const { latitude, longitude } = top10[selectedIdx];
        map.setView([latitude, longitude], 12, { animate: true });
        setTimeout(() => {
          top10MarkerRefs.current[selectedIdx]?.openPopup();
        }, 400);
      }
    }, [selectedIdx]);
    return null;
  }

  // Compute summary statistics
  const totalVotes = institutions.reduce((sum, i) => sum + (i.votes || 0), 0);
  const avgVotes = institutions.length ? Math.round(totalVotes / institutions.length) : 0;
  const maxCampus = institutions.reduce((max, i) => (i.votes > (max?.votes || 0) ? i : max), institutions[0] || null);
  const minCampus = institutions.reduce((min, i) => (i.votes < (min?.votes || Infinity) ? i : min), institutions[0] || null);
  // Province stats (handle as UPPERCASE, e.g. 'NL', 'ON')
  const provinceVotes: Record<string, number> = {};
  institutions.forEach(i => {
    const prov = i.province ? i.province.toUpperCase() : "";
    if (prov) provinceVotes[prov] = (provinceVotes[prov] || 0) + (i.votes || 0);
  });
  const provinceEntries = Object.entries(provinceVotes);
  const maxProvince = provinceEntries.reduce((max, [prov, votes]) => votes > (max?.[1] || 0) ? [prov, votes] : max, provinceEntries[0] || null);

  // Province code to full name mapping
  const PROVINCE_NAMES: Record<string, string> = {
    'NL': 'Nfld. & Lab.',
    'PE': 'Prince Edward Island',
    'NS': 'Nova Scotia',
    'NB': 'New Brunswick',
    'QC': 'Quebec',
    'ON': 'Ontario',
    'MB': 'Manitoba',
    'SK': 'Saskatchewan',
    'AB': 'Alberta',
    'BC': 'British Columbia',
    'YT': 'Yukon',
    'NT': 'Northwest Territories',
    'NU': 'Nunavut',
  };
  // Data for bar chart (province as uppercase, but display full names)
  const barData = provinceEntries.map(([province, votes]) => ({ Province: province, votes }));

  // Data insights
  const ontarioVotes = provinceVotes["ON"] || 0;
  const ontarioCampuses = institutions.filter(i => (i.province || "").toUpperCase() === "ON").length;
  const avgOntario = ontarioCampuses ? Math.round(ontarioVotes / ontarioCampuses) : 0;
  const insight1 = `Average votes per campus in Ontario: ${avgOntario} (national avg: ${avgVotes})`;
  // Insight 2: Top 5 campuses %
  const top5Votes = [...institutions].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 5).reduce((sum, i) => sum + (i.votes || 0), 0);
  const top5Percent = totalVotes ? Math.round((top5Votes / totalVotes) * 100) : 0;
  const insight2 = `The top 5 campuses account for ${top5Percent}% of all on-campus votes.`;
  // Insight 3: Active campuses
  const activeThreshold = 1000;
  const activeCount = institutions.filter(i => (i.votes || 0) > activeThreshold).length;
  const insight3 = `Only ${activeCount} out of ${institutions.length} campuses had more than ${activeThreshold} votes.`;

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
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <div className="mb-4 p-4">
        <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-300 font-semibold group">
          <span style={{ fontSize: 20, marginRight: 6 }}>&larr;</span>
          <span className="underline-hover group-hover:underline">Back</span>
        </Link>
      </div>
      {/* Header */}
      <header className="w-full px-4 py-6 border-b border-gray-200 bg-white dark:bg-black">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 text-center">
          On-Campus Federal Election Voting
        </h1>
        <section className="w-full max-w-3xl mx-auto mb-6 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-1">Why On-Campus Voting Data Matters</h2>
          <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
            On-campus voting initiatives are crucial for increasing youth engagement and making elections more accessible to students. Analyzing campus voting patterns helps identify where participation is strong, where it can be improved, and how resources can be better allocated to support student voters.
          </p>
          <div className="text-base font-semibold text-gray-800 dark:text-gray-100 bg-blue-50 dark:bg-blue-900 rounded px-4 py-2 mb-2 mt-1 text-center">
            Data covers the 2019 federal election.
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-2">What You'll Find on This Page</h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 text-base space-y-1">
            <li>An interactive map of post-secondary institutions that hosted voting stations in 2019.</li>
            <li>Top campuses by votes cast and a provincial breakdown of campus voting.</li>
            <li>Summary statistics and insights to highlight trends and opportunities for greater student participation.</li>
          </ul>
        </section>
      </header>
      {/* Main content: sidebar + map */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 md:p-8">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-4 mb-4 md:mb-0 md:mr-4 flex-shrink-0">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">About This Map</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            This dashboard visualizes the number of votes cast at post-secondary campuses during the 2019 Canadian federal election.
          </p>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Top 10 Voting Campuses</h3>
          <ol className="space-y-2">
            {top10.map((inst, idx) => (
              <li
                key={inst.name}
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors
                  ${selectedIdx === idx ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-gray-200 dark:hover:bg-gray-800"}`}
                onClick={() => setSelectedIdx(idx)}
              >
                <span className="font-semibold text-blue-700 dark:text-blue-300 mr-2">{idx + 1}.</span>
                <span className="font-medium text-gray-800 dark:text-gray-100" title={inst.name}>{inst.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{inst.votes}</span>
              </li>
            ))}
          </ol>
        </aside>
        {/* Map section */}
        <section className="flex-1 min-h-[60vh] h-[70vh] md:h-[80vh] w-full rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
          {loading ? (
            <div className="flex items-center justify-center h-full text-xl">Loading map...</div>
          ) : (
            <MapContainer
              center={[56, -96]}
              zoom={4}
              style={{ width: "100%", height: "100%" }}
              scrollWheelZoom={true}
            >
              <MapEffects selectedIdx={selectedIdx} top10={top10} top10MarkerRefs={top10MarkerRefs} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Render all markers, but attach refs to top 10 for popup control */}
              {institutions.map((inst, idx) => {
                // Find if this marker is in the top 10
                const top10Idx = top10.findIndex(t => t.name === inst.name);
                return (
                  <Marker
                    key={idx}
                    position={[inst.latitude, inst.longitude]}
                    icon={customMarker}
                    ref={top10Idx !== -1 ? (el => { top10MarkerRefs.current[top10Idx] = el; }) : undefined}
                  >
                    <Popup>
                      <strong>{inst["name"]}</strong><br />
                      {inst.Province}<br />
                      Votes: {inst["votes"]}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </section>
      </main>
      {/* Summary Statistics */}
      <section className="w-full max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <StatCard title="Total Votes" value={totalVotes.toLocaleString()} color="#2563eb" />
        <StatCard title="Average Votes per Campus" value={avgVotes.toLocaleString()} color="#2563eb" />
        <StatCard title="Highest Votes" value={maxCampus ? `${maxCampus.name} (${maxCampus.votes?.toLocaleString()})` : "-"} color="#16a34a" />
        <StatCard title="Lowest Votes" value={minCampus ? `${minCampus.name} (${minCampus.votes?.toLocaleString()})` : "-"} color="#dc2626" />
        <StatCard title="Province with Highest Total Votes" value={maxProvince ? `${maxProvince[0]} (${maxProvince[1].toLocaleString()})` : "-"} color="#a21caf" />
      </section>
      {/* Data Insights */}
      <section className="w-full max-w-5xl mx-auto mt-4 mb-8 p-4">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Data Insights</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-200">
          <li>{insight1}</li>
          <li>{insight2}</li>
          <li>{insight3}</li>
        </ul>
      </section>
      {/* Bar Chart by Province */}
      <section className="w-full max-w-5xl mx-auto mb-12 p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Total Votes by Province  </h2>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col items-center">
          {/* Y Axis Title + Chart Row */}
          <div style={{ display: 'flex', width: '100%' }}>
            <div style={{
              writingMode: 'vertical-rl',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 18,
              color: '#fff',
              marginRight: 16,
              minWidth: 40,
              height: 440,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(180deg)', // Rotates the Y-axis title by 180 degrees
            }}>
              Total Votes
            </div>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height={440}>
                <BarChart
                  data={barData}
                  margin={{ top: 32, right: 48, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="Province"
                    fontSize={16}
                    tickFormatter={(code) => code} // Show short form only
                    angle={0} // Horizontal text
                    textAnchor="middle"
                    interval={0}
                    minTickGap={10}
                    padding={{ left: 24, right: 24 }}
                  />
                  <YAxis
                    fontSize={14}
                    tickMargin={12}
                  />
                  <Tooltip 
                    formatter={(value: any) => value.toLocaleString()}
                    labelFormatter={(code) => (
                      <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{PROVINCE_NAMES[code] || code}</span>
                    )}
                  />
                  <Bar dataKey="votes" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* X Axis Title */}
          <div style={{
            width: '100%',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 18,
            color: '#fff',
            marginTop: 12,
          }}>
            Province
          </div>
        </div>
      </section>
      {/* Source Note */}
      <div className="w-full max-w-5xl mx-auto mb-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Source: <a href="https://www.elections.ca/content.aspx?section=res&dir=rep/off/camp_43&document=index&lang=e" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">Campus Voting Turnout - 42nd and 43rd General Elections</a>, elections.ca
      </div>
    </div>
  );
} 