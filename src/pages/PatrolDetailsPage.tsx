import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import L from "leaflet";

interface PatrolLog {
    id: string;
    path: { lat: number; lng: number }[];
    start_time: string;
    end_time: string | null;
    duration_minutes: number | null;
    distance_km: number | null;
}

const PatrolDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patrol, setPatrol] = useState<PatrolLog | null>(null);

    useEffect(() => {
        const fetchPatrol = async () => {
            const { data, error } = await supabase.from("patrol_logs").select("*").eq("id", id).single();
            if (error) {
                console.error("Error loading patrol:", error);
                return;
            }
            setPatrol(data);
        };
        fetchPatrol();
    }, [id]);

    const markerIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });

    if (!patrol) {
        return <p style={{ textAlign: "center", marginTop: 50 }}>Loading patrol details...</p>;
    }

    const center = patrol.path?.[0] || { lat: 0, lng: 0 };

    return (
        <div style={{ padding: 20 }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: "#6c757d",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 12px",
                    cursor: "pointer",
                    marginBottom: 15,
                }}
            >
                ← Back
            </button>

            <h2 style={{ textAlign: "center" }}>🗺️ Patrol Details</h2>

            <div style={{ textAlign: "center", marginBottom: 10 }}>
                <p>
                    <strong>Start:</strong> {new Date(patrol.start_time).toLocaleString()}
                </p>
                {patrol.end_time && (
                    <p>
                        <strong>End:</strong> {new Date(patrol.end_time).toLocaleString()}
                    </p>
                )}
                <p>
                    <strong>Duration:</strong> {patrol.duration_minutes ?? "-"} minutes
                </p>
                <p>
                    <strong>Distance:</strong> {patrol.distance_km ?? "-"} km
                </p>
            </div>

            {patrol.path?.length > 0 ? (
                <div style={{ height: "70vh", width: "100%", borderRadius: 10, overflow: "hidden" }}>
                    <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <Marker position={patrol.path[0]} icon={markerIcon} />
                        <Marker position={patrol.path[patrol.path.length - 1]} icon={markerIcon} />
                        <Polyline positions={patrol.path.map((p) => [p.lat, p.lng])} color="blue" />
                    </MapContainer>
                </div>
            ) : (
                <p style={{ textAlign: "center" }}>No path data available for this patrol.</p>
            )}
        </div>
    );
};

export default PatrolDetailsPage;
