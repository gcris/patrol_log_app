import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

// Helper function: Haversine formula to compute distance (in km)
const calculateDistanceKm = (coords: { lat: number; lng: number }[]) => {
    if (coords.length < 2) return 0;

    const R = 6371; // Earth's radius in km
    let total = 0;

    for (let i = 1; i < coords.length; i++) {
        const prev = coords[i - 1];
        const curr = coords[i];
        const dLat = ((curr.lat - prev.lat) * Math.PI) / 180;
        const dLon = ((curr.lng - prev.lng) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((prev.lat * Math.PI) / 180) *
            Math.cos((curr.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        total += R * c;
    }

    return total;
};

const PatrolPage: React.FC = () => {
    const [isPatrolling, setIsPatrolling] = useState(false);
    const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
    const [path, setPath] = useState<{ lat: number; lng: number }[]>([]);
    const [patrolId, setPatrolId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const navigate = useNavigate();

    const markerIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });

    // Start Patrol
    const startPatrolling = async () => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported by your browser.");
            return;
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            alert("Please log in first.");
            return;
        }

        const { data, error } = await supabase
            .from("patrol_logs")
            .insert([
                {
                    user_id: user.id,
                    start_time: new Date().toISOString(),
                    path: [],
                },
            ])
            .select()
            .single();

        if (error) {
            console.error("Error creating patrol log:", error.message);
            alert("Could not start patrol.");
            return;
        }

        setPatrolId(data.id);
        setStartTime(new Date());
        setIsPatrolling(true);
        setPath([]);

        const id = navigator.geolocation.watchPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const coords = { lat: latitude, lng: longitude };
                setCurrentPosition([latitude, longitude]);
                setPath((prev) => {
                    const updated = [...prev, coords];
                    savePathToSupabase(data.id, updated);
                    return updated;
                });
            },
            (err) => {
                console.error("Geolocation error:", err);
                alert("Unable to get location. Please allow GPS access.");
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );

        watchIdRef.current = id;
    };

    // Stop Patrol
    const stopPatrolling = async () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        if (!patrolId || !startTime) return;

        const endTime = new Date();
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
        const distanceKm = calculateDistanceKm(path);

        // Update patrol log with end_time, duration, and distance
        await supabase
            .from("patrol_logs")
            .update({
                end_time: endTime.toISOString(),
                duration_minutes: durationMinutes,
                distance_km: distanceKm.toFixed(2),
            })
            .eq("id", patrolId);

        alert(
            `✅ Patrol completed!\nDuration: ${durationMinutes} minutes\nDistance: ${distanceKm.toFixed(
                2
            )} km`
        );

        setIsPatrolling(false);
        setPatrolId(null);
    };

    // Save live path to Supabase
    const savePathToSupabase = async (id: string, pathData: any[]) => {
        await supabase.from("patrol_logs").update({ path: pathData }).eq("id", id);
    };

    const RecenterMap = ({ position }: { position: [number, number] }) => {
        const map = useMap();
        useEffect(() => {
            map.setView(position, map.getZoom());
        }, [position]);
        return null;
    };

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ textAlign: "center", marginBottom: 10 }}>🚓 Patrol Tracker</h2>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 15 }}>
                {!isPatrolling ? (
                    <div>
                        <button
                            onClick={startPatrolling}
                            style={{
                                backgroundColor: "#0d6efd",
                                color: "#fff",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: 8,
                                cursor: "pointer",
                            }}
                        >
                            Start Patrolling
                        </button>
                        <button
                            onClick={() => navigate("/patrol-history")}
                            style={{
                                backgroundColor: "#198754",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "10px 20px",
                                cursor: "pointer",
                                marginLeft: "10px",
                            }}
                        >
                            View History
                        </button>

                    </div>
                ) : (
                    <button
                        onClick={stopPatrolling}
                        style={{
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: 8,
                            cursor: "pointer",
                        }}
                    >
                        Stop Patrolling
                    </button>
                )}
            </div>

            {currentPosition ? (
                <div style={{ height: "70vh", width: "100%", borderRadius: 10, overflow: "hidden" }}>
                    <MapContainer center={currentPosition} zoom={16} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <Marker position={currentPosition} icon={markerIcon} />
                        {path.length > 1 && <Polyline positions={path.map((p) => [p.lat, p.lng])} color="blue" />}
                        <RecenterMap position={currentPosition} />
                    </MapContainer>
                </div>
            ) : (
                <p style={{ textAlign: "center" }}>
                    {isPatrolling
                        ? "Getting your current location..."
                        : "Press 'Start Patrolling' to begin tracking your patrol."}
                </p>
            )}

            {currentPosition && (
                <p style={{ textAlign: "center", marginTop: 10, color: "#333" }}>
                    <strong>Lat:</strong> {currentPosition[0].toFixed(6)} &nbsp;|&nbsp;
                    <strong>Lng:</strong> {currentPosition[1].toFixed(6)}
                </p>
            )}
        </div>
    );
};

export default PatrolPage;
