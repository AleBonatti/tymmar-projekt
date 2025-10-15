import { type ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";

interface ProtectedProps {
    children: ReactNode;
}

export function Protected({ children }: ProtectedProps) {
    const { user, isAdmin, loading, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Hook sempre dichiarato, l’effetto parte solo quando serve
    useEffect(() => {
        if (!loading && user && !isAdmin) {
            (async () => {
                await signOut();
                navigate("/login", { replace: true, state: { error: "unauthorized" } });
            })();
        }
    }, [loading, user, isAdmin, signOut, navigate]);

    // UI
    if (loading) return <div>Loading…</div>;

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    if (user && !isAdmin) {
        // breve placeholder mentre l’effetto esegue logout + redirect
        return <div>Accesso non autorizzato. Reindirizzamento…</div>;
    }

    return <>{children}</>;
}
