import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthProvider";

export function Protected({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return <div>Loading…</div>;
    if (!user)
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    return <>{children}</>;
}
