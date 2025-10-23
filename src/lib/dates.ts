import { format, parse, type Locale } from "date-fns";
import { it } from "date-fns/locale";

/**
 * Formatta una data come "dd/MM/yyyy" o un formato custom.
 *
 * @param value Date, stringa ISO o null/undefined
 * @param opts formato custom e lingua opzionale
 * @returns stringa formattata o "—"
 */
export function formatDate(
    value?: Date | string | null,
    opts?: {
        pattern?: string;
        showTime?: boolean;
        locale?: Locale;
    }
): string {
    if (!value) return "—";

    let d: Date;
    try {
        d = value instanceof Date ? value : new Date(value);
        if (isNaN(d.getTime())) return "—";
    } catch {
        return "—";
    }

    const { pattern, showTime, locale } = opts ?? {};
    const fmt = pattern ?? (showTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy");

    return format(d, fmt, { locale: locale ?? it });
}

/**
 * Converte una stringa "dd/MM/yyyy" o personalizzata in Date.
 *
 * @param value stringa da convertire
 * @param opts pattern e lingua opzionali
 * @returns oggetto Date o null se non valido
 */
export function parseDate(
    value?: string | null,
    opts?: {
        pattern?: string;
        locale?: Locale;
    }
): Date | null {
    if (!value || typeof value !== "string") return null;

    const { pattern, locale } = opts ?? {};
    const fmt = pattern ?? "dd/MM/yyyy";

    try {
        const parsed = parse(value, fmt, new Date(), {
            locale: locale ?? it,
        });
        return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
        return null;
    }
}
