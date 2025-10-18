import React, { useEffect, useState } from "react";
import appLogo from "../assets/app_logo.png";

interface LoadingScreenProps {
    onFinish?: () => void; // optional callback when fade-out finishes
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinish }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Show logo for a short moment
        const timer = setTimeout(() => setFadeOut(true), 1000);
        // Trigger onFinish after fade animation
        const cleanup = setTimeout(() => {
            if (onFinish) onFinish();
        }, 1500);

        return () => {
            clearTimeout(timer);
            clearTimeout(cleanup);
        };
    }, [onFinish]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                justifyContent: "center",
                alignItems: "center",
                opacity: fadeOut ? 0 : 1,
                transition: "opacity 0.5s ease-in-out",
            }}
        >
            <img
                src={appLogo}
                alt="Loading..."
                style={{
                    width: 120,
                    height: "auto",
                    marginBottom: 20,
                    animation: "pulse 2s infinite",
                }}
            />

            <style>
                {`
          @keyframes pulse {
            0% { opacity: 0.6; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1.02); }
            100% { opacity: 0.6; transform: scale(0.98); }
          }
        `}
            </style>
        </div>
    );
};

export default LoadingScreen;
