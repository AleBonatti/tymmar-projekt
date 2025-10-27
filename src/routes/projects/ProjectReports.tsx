import { useOutletContext } from "react-router-dom";
import type { ProjectOutletContext } from "./ProjectContext";

export default function ProjectReports() {
    const { project, loading, error, reload } = useOutletContext<ProjectOutletContext>();

    if (loading) return <div>Loading…</div>;
    if (error || !project) return <div className="text-red-600">{error ?? "Project not found"}</div>;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Report — {project.title}</h2>
                <button
                    className="text-sm underline"
                    onClick={() => void reload()}>
                    Reload
                </button>
            </div>
            {/* widget report */}
        </div>
    );
}
