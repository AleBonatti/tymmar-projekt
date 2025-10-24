import { Route, Routes } from "react-router-dom";
import { Header } from "@/components/Header";

import { Home } from "@/routes/Home";
import { Login } from "@/routes/Login";
import { Dashboard } from "@/routes/Dashboard";
import { Protected } from "@/routes/Protected";
import { ResetPassword } from "@/routes/ResetPassword";

import { ProjectsList } from "@/routes/projects/ProjectsList";
import { ProjectFormNew } from "@/routes/projects/ProjectFormNew";
import { ProjectFormEdit } from "@/routes/projects/ProjectFormEdit";

import { CustomersList } from "@/routes/customers/CustomersList";
import { CustomerFormNew } from "@/routes/customers/CustomerFormNew";
import { CustomerFormEdit } from "@/routes/customers/CustomerFormEdit";

export function App() {
    return (
        <div className="min-h-dvh flex flex-col bg-app-bg">
            <Header />

            <main className="flex-1 mx-auto max-w-7xl w-full p-4 bg-app-bg">
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
                    <Route
                        path="/projects"
                        element={
                            <Protected>
                                <ProjectsList />
                            </Protected>
                        }
                    />
                    <Route
                        path="/projects/new"
                        element={
                            <Protected>
                                <ProjectFormNew />
                            </Protected>
                        }
                    />
                    <Route
                        path="/projects/:id/edit"
                        element={
                            <Protected>
                                <ProjectFormEdit />
                            </Protected>
                        }
                    />
                    <Route
                        path="/customers"
                        element={
                            <Protected>
                                <CustomersList />
                            </Protected>
                        }
                    />
                    <Route
                        path="/customers/new"
                        element={
                            <Protected>
                                <CustomerFormNew />
                            </Protected>
                        }
                    />
                    <Route
                        path="/customers/:id/edit"
                        element={
                            <Protected>
                                <CustomerFormEdit />
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
