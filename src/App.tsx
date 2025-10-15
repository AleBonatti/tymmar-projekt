import { Link, NavLink, Route, Routes } from "react-router-dom";
import { Home } from "@/routes/Home";
import { Login } from "@/routes/Login";
import { Dashboard } from "@/routes/Dashboard";
import { Protected } from "@/routes/Protected";
import { ResetPassword } from "@/routes/ResetPassword";

export function App() {
    return (
        <div className="min-h-dvh flex flex-col">
            <header className="border-b bg-white">
                <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
                    <Link
                        to="/"
                        className="font-semibold">
                        tymmar-projekt
                    </Link>
                    <div className="ml-auto flex items-center gap-3">
                        <NavLink
                            to="/"
                            className={({ isActive }) => (isActive ? "underline" : "")}>
                            Home
                        </NavLink>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => (isActive ? "underline" : "")}>
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/login"
                            className={({ isActive }) => (isActive ? "underline" : "")}>
                            Login
                        </NavLink>
                    </div>
                </nav>
            </header>

            <main className="flex-1 mx-auto max-w-7xl w-full p-4">
                <Routes>
                    <Route
                        path="/"
                        element={<Home />}
                    />
                    <Route
                        path="/login"
                        element={<Login />}
                    />
                    <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <Protected>
                                <Dashboard />
                            </Protected>
                        }
                    />
                </Routes>
            </main>

            <footer className="border-t bg-white text-sm text-slate-500">
                <div className="mx-auto max-w-7xl px-4 py-3">Vite + React + Supabase + Tailwind v4</div>
            </footer>
        </div>
    );
}
