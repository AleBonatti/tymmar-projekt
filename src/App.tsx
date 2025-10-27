import { Route, Routes } from "react-router-dom";
import { Header } from "@/components/Header";

import { Home } from "@/routes/Home";
import { Login } from "@/routes/Login";
import { Dashboard } from "@/routes/Dashboard";
import { Protected } from "@/routes/Protected";
import { ResetPassword } from "@/routes/ResetPassword";
import { lazy } from "react";

import { ProjectsList } from "@/routes/projects/ProjectsList";
import { ProjectFormNew } from "@/routes/projects/ProjectFormNew";
import { ProjectFormEdit } from "@/routes/projects/ProjectFormEdit";

import { CustomersList } from "@/routes/customers/CustomersList";
import { CustomerFormNew } from "@/routes/customers/CustomerFormNew";
import { CustomerFormEdit } from "@/routes/customers/CustomerFormEdit";

// Lazy pages
const ProjectLayout = lazy(() => import("@/routes/projects/ProjectLayout"));
//const ProjectTasksBoard = lazy(() => import("@/routes/projects/ProjectTasksBoard"));
const ProjectTasksList = lazy(() => import("@/routes/projects/ProjectTasksList"));
const ProjectMilestones = lazy(() => import("@/routes/projects/ProjectMilestones"));
const ProjectReports = lazy(() => import("@/routes/projects/ProjectReports"));

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
                    <Route path="/projects">
                        <Route
                            index
                            element={
                                <Protected>
                                    <ProjectsList />
                                </Protected>
                            }
                        />
                        <Route
                            path="new"
                            element={
                                <Protected>
                                    <ProjectFormNew />
                                </Protected>
                            }
                        />
                        {/* redirect default a tasks board */}
                        <Route
                            path=":id/edit"
                            element={<ProjectLayout />}>
                            <Route
                                index
                                element={
                                    <Protected>
                                        <ProjectFormEdit />
                                    </Protected>
                                }
                            />
                            <Route
                                path="tasks"
                                element={
                                    <Protected>
                                        <ProjectTasksList />
                                    </Protected>
                                }
                            />
                            {/* <Route
                                path="tasks/list"
                                element={<ProjectTasksBoard />}
                            /> */}
                            <Route
                                path="milestones"
                                element={
                                    <Protected>
                                        <ProjectMilestones />
                                    </Protected>
                                }
                            />
                            <Route
                                path="reports"
                                element={
                                    <Protected>
                                        <ProjectReports />
                                    </Protected>
                                }
                            />{" "}
                        </Route>
                    </Route>
                </Routes>
            </main>

            <footer className="border-t bg-white text-sm text-slate-500">
                <div className="mx-auto max-w-7xl px-4 py-3">Vite + React + Supabase + Tailwind v4</div>
            </footer>
        </div>
    );
}
