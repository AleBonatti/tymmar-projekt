// src/routes/projects/ProjectLayout.tsx
import { NavLink, Outlet, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import type { Project } from "@/modules/projects/types";
import { apiGetProject } from "@/modules/projects/api.vercel";
import type { ProjectOutletContext } from "./ProjectContext";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProjectLayout() {
    const { id } = useParams<{ id: string }>();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!id) {
            setError("ID mancante");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const p = await apiGetProject(id);
            setProject(p);
        } catch (e) {
            const msg = (e as { message?: string })?.message ?? "Errore caricamento progetto";
            setError(msg);
            setProject(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void load();
    }, [load]);

    const ctx: ProjectOutletContext = {
        project,
        loading,
        error,
        reload: load,
    };

    const link = ({ isActive }: { isActive: boolean }) => ["px-3 py-2 rounded-md text-sm transition-colors", isActive ? "bg-[#3A726A] text-white" : "text-[#3A726A] hover:bg-[#E4FDE0]"].join(" ");

    return (
        <div className="space-y-4">
            <header className="flex items-center justify-between">
                <div>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    ) : error ? (
                        <div className="text-red-600 text-sm">{error}</div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-semibold">{project?.title ?? `Project #${id}`}</h1>
                            <p className="text-sm text-slate-500">ID: {id}</p>
                        </>
                    )}
                </div>

                {/* Tabs */}
                <nav className="flex gap-2">
                    <NavLink
                        to=""
                        end
                        className={link}>
                        Details
                    </NavLink>
                    <NavLink
                        to="tasks"
                        className={link}>
                        Tasks
                    </NavLink>
                    {/* <NavLink
                        to="tasks/list"
                        className={link}>
                        List
                    </NavLink> */}
                    <NavLink
                        to="milestones"
                        className={link}>
                        Milestones
                    </NavLink>
                    <NavLink
                        to="reports"
                        className={link}>
                        Report
                    </NavLink>
                </nav>
            </header>

            {/* Children ricevono il contesto */}
            <Outlet context={ctx} />
        </div>
    );
}
