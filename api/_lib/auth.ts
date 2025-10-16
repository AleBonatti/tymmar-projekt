import type { VercelRequest } from "@vercel/node";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabase";

export interface AuthContext {
    token: string;
    user: User;
    isAdmin: boolean;
}

export async function requireAuthAdmin(req: VercelRequest): Promise<AuthContext> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) {
        throw new Error("Unauthorized: token mancante");
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) {
        throw new Error("Unauthorized: token non valido");
    }

    const role = (data.user.user_metadata as Record<string, unknown>)?.role;
    const isAdmin = role === "admin";
    if (!isAdmin) {
        throw new Error("Forbidden: solo amministratori");
    }

    return { token, user: data.user, isAdmin: true };
}
