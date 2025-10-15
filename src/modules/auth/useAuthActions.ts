import { supabase } from "@/modules/supabase/client";

export function useAuthActions() {
    async function signInWithPassword(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    }

    async function signUpWithPassword(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    }

    async function sendMagicLink(email: string) {
        const { data, error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        return data;
    }

    async function signInWithProvider(provider: "github" | "google") {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: window.location.origin },
        });
        if (error) throw error;
        return data; // redireziona al provider
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    return { signInWithPassword, signUpWithPassword, sendMagicLink, signInWithProvider, signOut };
}
