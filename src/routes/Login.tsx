import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/modules/supabase/client";
import { useAuth } from "@/modules/auth/AuthProvider";
import { Navigate, useLocation } from "react-router-dom";

export function Login() {
    const { user } = useAuth();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || "/dashboard";
    if (user)
        return (
            <Navigate
                to={from}
                replace
            />
        );

    return (
        <div className="max-w-sm mx-auto p-6 bg-white rounded-lg shadow-sm">
            <h1 className="text-xl font-semibold mb-4">Accedi / Registrati</h1>
            <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={["github", "google"]}
            />
        </div>
    );
}
