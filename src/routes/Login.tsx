import { type FormEvent, useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/modules/supabase/client";
import { useAuth } from "@/modules/auth/AuthContext";

interface LocationState {
    from?: { pathname: string };
}

export function Login() {
    const { user } = useAuth();
    const location = useLocation();
    const state = location.state as LocationState | null;
    const from = state?.from?.pathname || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    if (user)
        return (
            <Navigate
                to={from}
                replace
            />
        );

    async function handleSignIn(e: FormEvent) {
        e.preventDefault();
        setPending(true);
        setErr(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setErr(error.message || "Credenziali non valide.");
        setPending(false);
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm space-y-6">
            <h1 className="text-xl font-semibold">Accedi</h1>

            <form
                onSubmit={handleSignIn}
                className="space-y-3">
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Password</label>
                    <input
                        className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </div>

                <button
                    disabled={pending}
                    className="rounded px-3 py-2 ring-1 w-full">
                    {pending ? "Accesso in corso…" : "Entra"}
                </button>

                <div className="text-right">
                    <Link
                        to="/reset-password"
                        className="text-sm underline">
                        Password dimenticata?
                    </Link>
                </div>

                {err && <p className="text-red-600 text-sm">{err}</p>}
            </form>
        </div>
    );
}
