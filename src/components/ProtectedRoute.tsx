import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import LoadingScreen from "./LoadingScreen";

interface ProtectedRouteProps {
    children: JSX.Element;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loadingDone, setLoadingDone] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            setIsAuthenticated(!!data.session);
        };

        checkSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (isAuthenticated === null || !loadingDone) {
        return <LoadingScreen onFinish={() => setLoadingDone(true)} />;
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return children;
}

export default ProtectedRoute;
