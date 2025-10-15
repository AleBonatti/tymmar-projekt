import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
};

// Context senza default → forziamo l'uso dentro il provider
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
