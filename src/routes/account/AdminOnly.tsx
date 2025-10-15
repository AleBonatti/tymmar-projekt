import { useCurrentProfile } from "@/modules/auth/useCurrentProfile";

export function AdminOnly({ children }: { children: React.ReactNode }) {
    const { isAdmin, loading } = useCurrentProfile();
    if (loading) return <div>Loading…</div>;
    if (!isAdmin) return <div className="text-red-600">Solo admin.</div>;
    return <>{children}</>;
}
