// src/routes/projects/ProjectMilestones.tsx
import { useParams } from "react-router-dom";

export default function ProjectMilestones() {
    const { id } = useParams<{ id: string }>();
    return (
        <div className="rounded-md ring-1 ring-slate-200 p-4 bg-white">
            <h2 className="text-lg font-semibold mb-3">Milestones</h2>
            <p className="text-slate-600 text-sm">CRUD milestones per progetto #{id} + progress bar.</p>
            {/* TODO: elenco + form modal */}
        </div>
    );
}
