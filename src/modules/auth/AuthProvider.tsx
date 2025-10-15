import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/modules/supabase/client";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const role = session?.user?.user_metadata?.role ?? null;
    const isAdmin = role === "admin";

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session ?? null);
            setLoading(false);
        });
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_evt, newSession) => {
            setSession(newSession);
        });
        return () => subscription.unsubscribe();
    }, []);

    async function signOut() {
        await supabase.auth.signOut();
    }

    return <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, signOut, role, isAdmin }}>{children}</AuthContext.Provider>;
}
