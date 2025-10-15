import { type FormEvent, useEffect, useState } from "react";
import { supabase } from "@/modules/supabase/client";

export function ResetPassword() {
    const [email, setEmail] = useState("");
    const [phase, setPhase] = useState<"request" | "update">("request");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    // Se l'URL include i parametri di recupero (tipo access_token),
    // Supabase imposta una sessione temporanea → abilita fase "update".
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes("type=recovery") || hash.includes("access_token")) {
            setPhase("update");
        }
    }, []);

    async function handleRequest(e: FormEvent) {
        e.preventDefault();
        setPending(true);
        setErr(null);
        setMsg(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) setErr(error.message);
        else setMsg("Email inviata. Controlla la posta e apri il link.");
        setPending(false);
    }

    async function handleUpdate(e: FormEvent) {
        e.preventDefault();
        setPending(true);
        setErr(null);
        setMsg(null);
        //const { data, error } = await supabase.auth.updateUser({ password });
        const { error } = await supabase.auth.updateUser({ password });
        if (error) setErr(error.message);
        else setMsg("Password aggiornata! Ora puoi tornare alla pagina di login.");
        setPending(false);
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm space-y-6">
            <h1 className="text-xl font-semibold">Reset Password</h1>

            {phase === "request" ? (
                <form
                    onSubmit={handleRequest}
                    className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        disabled={pending}
                        className="rounded px-3 py-2 ring-1 w-full">
                        {pending ? "Invio in corso…" : "Invia email di reset"}
                    </button>
                    {msg && <p className="text-green-600 text-sm">{msg}</p>}
                    {err && <p className="text-red-600 text-sm">{err}</p>}
                </form>
            ) : (
                <form
                    onSubmit={handleUpdate}
                    className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium">Nuova password</label>
                        <input
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        disabled={pending}
                        className="rounded px-3 py-2 ring-1 w-full">
                        {pending ? "Aggiorno…" : "Imposta nuova password"}
                    </button>
                    {msg && <p className="text-green-600 text-sm">{msg}</p>}
                    {err && <p className="text-red-600 text-sm">{err}</p>}
                </form>
            )}
        </div>
    );
}
