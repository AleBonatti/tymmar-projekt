// src/modules/profiles/api.ts
import { supabase } from "@/modules/supabase/client";
import type { Profile } from "@/modules/auth/useCurrentProfile";

export async function listProfiles(query?: string): Promise<Profile[]> {
    let req = supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (query) req = req.ilike("email", `%${query}%`);
    const { data, error } = await req;
    if (error) throw error;
    return data as Profile[];
}

export async function getProfile(id: string): Promise<Profile> {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (error) throw error;
    return data as Profile;
}

export type CreateProfileInput = {
    id: string;
    email?: string;
    username?: string;
    full_name?: string;
    role?: "admin" | "user";
};

export async function createProfile(p: CreateProfileInput): Promise<Profile> {
    const { data, error } = await supabase.from("profiles").insert(p).select().single();
    if (error) throw new Error(error.message);
    return data as Profile;
}

export type UpdateProfilePatch = Partial<{
    email: string | null;
    username: string | null;
    full_name: string | null;
    role: "admin" | "user";
}>;

export async function updateProfile(id: string, patch: UpdateProfilePatch): Promise<Profile> {
    const { data, error } = await supabase.from("profiles").update(patch).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data as Profile;
}

export async function deleteProfile(id: string): Promise<void> {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) throw new Error(error.message);
}
