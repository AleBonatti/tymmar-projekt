import type { VercelResponse } from "@vercel/node";

export function sendError(res: VercelResponse, status: number, message: string): void {
    res.status(status).json({ error: message });
}

export function parseZodError(e: unknown): string {
    if (typeof e === "object" && e !== null && "issues" in e && Array.isArray((e as { issues: Array<{ message: string }> }).issues)) {
        const z = e as { issues: Array<{ message: string }> };
        return z.issues.map((i) => i.message).join("; ");
    }
    return "Payload non valido";
}
