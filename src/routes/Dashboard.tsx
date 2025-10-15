import { useAuth } from "@/modules/auth/AuthContext";

export function Dashboard() {
    const { user, signOut } = useAuth();
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Dashboard (protected)</h1>
            <p>
                Utente: <span className="font-mono">{user?.email}</span>
            </p>
            <button
                onClick={signOut}
                className="rounded px-3 py-2 ring-1">
                Logout
            </button>
        </div>
    );
}
