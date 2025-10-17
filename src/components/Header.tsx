import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";

export function Header() {
    const { user, loading, signOut } = useAuth();

    const link = ({ isActive }: { isActive: boolean }) => (isActive ? "underline" : "");

    // 🔸 Stato "loading" → evita flicker durante il controllo sessione
    if (loading) {
        return (
            <header className="border-b bg-white">
                <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                    <Link
                        to="/"
                        className="font-semibold">
                        tymmar-projekt
                    </Link>
                    <span className="text-sm text-slate-400">Verifica sessione…</span>
                </nav>
            </header>
        );
    }

    return (
        <header className="border-b bg-white">
            <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
                <Link
                    to="/"
                    className="font-semibold">
                    tymmar-projekt
                </Link>

                <div className="ml-auto flex items-center gap-3">
                    {/* Non loggato */}
                    {!user && (
                        <>
                            <NavLink
                                to="/"
                                className={link}>
                                Home
                            </NavLink>
                            <NavLink
                                to="/login"
                                className={link}>
                                Login
                            </NavLink>
                        </>
                    )}

                    {/* Loggato */}
                    {user && (
                        <>
                            <NavLink
                                to="/dashboard"
                                className={link}>
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/account"
                                className={link}>
                                Gestione Account
                            </NavLink>
                            <NavLink
                                to="/projects"
                                className={link}>
                                Gestione Progetti
                            </NavLink>
                            <button
                                onClick={signOut}
                                className="text-sm rounded px-2 py-1 ring-1">
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
