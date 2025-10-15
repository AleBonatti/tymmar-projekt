import { useEffect, useState } from "react";
import { supabase } from "@/modules/supabase/client";
import { useAuth } from "@/modules/auth/AuthContext";

export type Profile = {
    id: string;
    email: string | null;
    username: string | null;
    full_name: string | null;
    role: "admin" | "user";
    created_at: string;
    updated_at: string;
};

export function useCurrentProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function run() {
            if (!user) {
                setProfile(null);
                setLoading(false);
                return;
            }
            const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            if (!mounted) return;
            if (error) {
                console.error(error);
                setProfile(null);
            } else setProfile(data as Profile);
            setLoading(false);
        }
        run();
        return () => {
            mounted = false;
        };
    }, [user]);

    const isAdmin = user?.user_metadata?.role === "admin" || profile?.role === "admin";

    return { profile, isAdmin, loading };
}
