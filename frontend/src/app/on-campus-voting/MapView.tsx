"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "/public/marker.png";

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

  useEffect(() => {
    console.log("Before fetch")

    fetch("http://localhost:8000/api/voter-turnout")
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

  console.log(institutions)

  const customMarker = new L.Icon({
    iconUrl: "/marker.png",
    iconSize: [40, 40], // Adjust size as needed
    iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -40], // Point from which the popup should open relative to the iconAnchor
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="w-[80vw] h-[80vh] rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xl">Loading map...</div>
        ) : (
          <MapContainer
            center={[56, -96]}
            zoom={4}
            style={{ width: "100%", height: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {institutions.map((inst, idx) => (
              <Marker
                key={idx}
                position={[inst.latitude, inst.longitude]}
                icon={customMarker}
              >
                <Popup>
                  <strong>{inst["name"]}</strong><br />
                  {inst.Province}<br />
                  Votes: {inst["votes"]}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
} 