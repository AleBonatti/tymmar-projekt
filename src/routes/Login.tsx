import { type FormEvent, useState, useEffect } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/modules/supabase/client";
import { useAuth } from "@/modules/auth/AuthContext";
import { Toast } from "@/components/Toast";
import { ToastViewport } from "@/components/ToastViewport";

interface LocationState {
    from?: { pathname: string };
    error?: "unauthorized";
}

export function Login() {
    const { user } = useAuth();
    const location = useLocation();
    const state = location.state as LocationState | null;
    const unauthorized = state?.error === "unauthorized";

    const from = state?.from?.pathname || "/dashboard";

    const [email, setEmail] = useState("info@alessandrobonatti.it");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // toast per messaggi “globali”
    const [toast, setToast] = useState<{ message: string; variant: "info" | "success" | "warning" | "error" } | null>(null);

    // Se arrivo da Protected con errore di autorizzazione, mostra toast
    useEffect(() => {
        if (state?.error === "unauthorized") {
            setToast({
                message: "Accesso non autorizzato: solo amministratori.",
                variant: "error",
            });
            // opzionale: potresti anche pulire l'history state qui se preferisci
            // navigate(location.pathname, { replace: true });
        }
    }, [state?.error]);

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
        <div className="relative">
            <ToastViewport>
                {toast && (
                    <Toast
                        message={toast.message}
                        variant={toast.variant}
                        durationMs={3500}
                        onClose={() => setToast(null)}
                    />
                )}
            </ToastViewport>
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm space-y-6">
                <h1 className="text-xl font-semibold">Accedi</h1>
                {unauthorized && <div className="mb-4 p-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded">Accesso non autorizzato: solo utenti amministratori.</div>}

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
        </div>
    );
}
