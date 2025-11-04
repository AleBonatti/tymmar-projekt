// src/routes/projects/ProjectContext.ts
import type { Project } from "@/modules/projects/types";

export type ProjectOutletContext = {
  project: Project | null;
  loading: boolean;
  error: string | null;
  reload(): Promise<void>;
};
