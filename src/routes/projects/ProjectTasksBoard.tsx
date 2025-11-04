import { useOutletContext } from "react-router-dom";
import type { ProjectOutletContext } from "./ProjectContext";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProjectTasksBoard() {
    const { project, loading, error } = useOutletContext<ProjectOutletContext>();

    if (loading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }
    if (error || !project) return <div className="text-red-600">{error ?? "Project not found"}</div>;

    return (
        <div className="rounded-md ring-1 ring-slate-200 p-4 bg-white">
            <h2 className="text-lg font-semibold mb-3">Boarda — {project.title}</h2> {/* TODO: colonne Kanban */}
        </div>
    );
}
