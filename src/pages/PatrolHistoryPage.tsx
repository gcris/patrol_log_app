import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

interface PatrolLog {
    id: string;
    start_time: string;
    end_time: string | null;
    duration_minutes: number | null;
    distance_km: number | null;
}

const PatrolHistoryPage: React.FC = () => {
    const [patrols, setPatrols] = useState<PatrolLog[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatrols = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                alert("Please log in first.");
                return;
            }

            const { data, error } = await supabase
                .from("patrol_logs")
                .select("*")
                .eq("user_id", user.id)
                .order("start_time", { ascending: false });

            if (error) {
                console.error("Error fetching patrol logs:", error);
            } else {
                setPatrols(data || []);
            }
        };

        fetchPatrols();
    }, []);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString();
    };

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ textAlign: "center", marginBottom: 20 }}>📋 Patrol History</h2>

            {patrols.length === 0 ? (
                <p style={{ textAlign: "center" }}>No patrol logs found.</p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    {/* Table for large screens */}
                    <table
                        className="history-table"
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            backgroundColor: "#fff",
                            borderRadius: 8,
                            overflow: "hidden",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        }}
                    >
                        <thead style={{ background: "#0d6efd", color: "#fff" }}>
                            <tr>
                                <th style={{ padding: 10, textAlign: "left" }}>Start Time</th>
                                <th style={{ padding: 10 }}>Duration (min)</th>
                                <th style={{ padding: 10 }}>Distance (km)</th>
                                <th style={{ padding: 10 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patrols.map((patrol) => (
                                <tr key={patrol.id} className="history-row">
                                    <td style={{ padding: 10 }}>{formatDate(patrol.start_time)}</td>
                                    <td style={{ padding: 10, textAlign: "center" }}>
                                        {patrol.duration_minutes ?? "-"}
                                    </td>
                                    <td style={{ padding: 10, textAlign: "center" }}>
                                        {patrol.distance_km ?? "-"}
                                    </td>
                                    <td style={{ padding: 10, textAlign: "center" }}>
                                        <button
                                            onClick={() => navigate(`/patrol/${patrol.id}`)}
                                            style={{
                                                background: "#0d6efd",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "6px 12px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Cards for small screens */}
                    <div className="history-cards">
                        {patrols.map((patrol) => (
                            <div
                                key={patrol.id}
                                style={{
                                    background: "#fff",
                                    borderRadius: 8,
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                    padding: 16,
                                    marginBottom: 12,
                                }}
                            >
                                <p style={{ margin: "0 0 8px" }}>
                                    <strong>Start:</strong> {formatDate(patrol.start_time)}
                                </p>
                                <p style={{ margin: "0 0 8px" }}>
                                    <strong>Duration:</strong> {patrol.duration_minutes ?? "-"} minutes
                                </p>
                                <p style={{ margin: "0 0 12px" }}>
                                    <strong>Distance:</strong> {patrol.distance_km ?? "-"} km
                                </p>
                                <button
                                    onClick={() => navigate(`/patrol/${patrol.id}`)}
                                    style={{
                                        width: "100%",
                                        background: "#0d6efd",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 6,
                                        padding: "10px 0",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inline responsive CSS */}
            <style>
                {`
          @media (max-width: 768px) {
            .history-table {
              display: none;
            }
            .history-cards {
              display: block;
            }
          }

          @media (min-width: 769px) {
            .history-table {
              display: table;
            }
            .history-cards {
              display: none;
            }
          }
        `}
            </style>
        </div>
    );
};

export default PatrolHistoryPage;
