export interface Member {
    id: string; // profiles.id
    name: string | null;
    surname: string | null;
    email: string;
}

const norm = (s: string | null) => (s ?? "").trim();

export function getFullname(m: Member): string {
    const parts = [norm(m.name), norm(m.surname)].filter(Boolean);
    return parts.join(" ");
}
