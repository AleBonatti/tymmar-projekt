import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import clsx from "clsx";

type AutocompleteProps<T> = {
    /** Etichetta sopra al campo */
    label?: string;
    /** Placeholder nell’input */
    placeholder?: string;

    /** Elementi selezionati (modello T arbitrario) */
    selected: T[];

    /** Aggiunge un elemento selezionato */
    onAdd(item: T): void;

    /** Rimuove un elemento selezionato (identificato da id) */
    onRemove(id: string): void;

    /** Funzione di ricerca asincrona: dato q, ritorna elementi T */
    search(q: string): Promise<T[]>;

    /** Estrazione chiave/identificativo univoco */
    getId(item: T): string;

    /** Etichetta principale da mostrare */
    getLabel(item: T): string | null;

    /** Testo secondario (facoltativo) */
    getDescription?(item: T): string | undefined;

    /** Render personalizzato dell’opzione nel menu (facoltativo) */
    renderOption?(item: T, isHighlighted: boolean): React.ReactNode;

    /** Minimo caratteri prima di cercare */
    minChars?: number; // default 2
    /** Debounce in ms per la ricerca */
    debounceMs?: number; // default 250
    /** Disabilita input */
    disabled?: boolean;
    /** Classi extra sul wrapper */
    className?: string;
};

export function Autocomplete<T>({ label, placeholder = "Cerca…", selected, onAdd, onRemove, search, getId, getLabel, getDescription, renderOption, minChars = 3, debounceMs = 250, disabled = false, className }: AutocompleteProps<T>) {
    const [q, setQ] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [options, setOptions] = useState<T[]>([]);
    const [highlight, setHighlight] = useState<number>(-1);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Evita di proporre elementi già selezionati
    const selectedIds = useMemo(() => new Set(selected.map(getId)), [selected, getId]);
    const filtered = useMemo(() => options.filter((o) => !selectedIds.has(getId(o))), [options, selectedIds, getId]);

    // Debounce ricerca
    useEffect(() => {
        if (q.trim().length < minChars) {
            setOptions([]);
            setHighlight(-1);
            setOpen(false);
            return;
        }
        let cancelled = false;
        setOpen(true);
        setLoading(true);
        const t = window.setTimeout(async () => {
            try {
                const res = await search(q.trim());
                if (!cancelled) {
                    setOptions(res);
                    setHighlight(res.length > 0 ? 0 : -1);
                }
            } catch {
                if (!cancelled) setOptions([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, debounceMs);

        return () => {
            cancelled = true;
            window.clearTimeout(t);
        };
    }, [q, search, minChars, debounceMs]);

    // Chiudi al click fuori
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) {
                setOpen(false);
                setHighlight(-1);
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    function add(item: T) {
        onAdd(item);
        setQ("");
        setOptions([]);
        setOpen(false);
        setHighlight(-1);
        inputRef.current?.focus();
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setOpen(true);
            setHighlight(filtered.length > 0 ? 0 : -1);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
        } else if (e.key === "Enter") {
            if (open && highlight >= 0 && filtered[highlight]) {
                e.preventDefault();
                add(filtered[highlight]);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
            setHighlight(-1);
        }
    }

    return (
        <div
            ref={rootRef}
            className={clsx("w-full", className)}>
            {label && <label className="block text-sm font-medium text-app-accent/90 mb-1">{label}</label>}
            {/* Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.currentTarget.value)}
                    onFocus={() => {
                        if (q.trim().length >= minChars) setOpen(true);
                    }}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-expanded={open}
                    aria-autocomplete="list"
                    role="combobox"
                    className={clsx(
                        "ring-1 ring-app-accent/30 w-full rounded-md bg-white text-app-accent placeholder-app-accent/50",
                        "focus:outline-none focus:ring-2 focus:ring-app-accent/40",
                        "px-3 py-2 pr-8 transition-colors" // 👈 spazio per lo spinner
                    )}
                />
                {/* 🔹 Clear button */}
                {!loading && q.trim().length > 0 && (
                    <button
                        type="button"
                        onClick={() => {
                            setQ("");
                            setOpen(false);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-app-accent/70 hover:text-app-accent"
                        aria-label="Clear">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            {/* Accessibilità */}
            <div
                className="sr-only"
                aria-live="polite">
                {loading ?? "Searching..."}
            </div>
            <div>
                {/* Dropdown */}
                {open && (
                    <div
                        role="listbox"
                        className="z-10 mt-1 max-h-64 w-full overflow-auto rounded-md bg-white ring-1 ring-app-accent/30 shadow-sm">
                        {loading && (
                            <div className="px-2 py-2">
                                <Loader2
                                    className="h-4 w-4 text-app-accent animate-spin"
                                    aria-hidden="true"
                                />
                            </div>
                        )}

                        {!loading && filtered.length === 0 && q.trim().length >= minChars && (
                            <div className="px-2 py-1">
                                <span className="text-sm text-slate-500">No results</span>
                            </div>
                        )}

                        {!loading &&
                            filtered.map((item, i) => {
                                const id = getId(item);
                                const isHi = highlight === i;

                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        role="option"
                                        aria-selected={isHi}
                                        className={clsx("w-full text-left px-3 py-2 text-sm", isHi ? "bg-[#E4FDE0]" : "hover:bg-slate-50")}
                                        onMouseEnter={() => setHighlight(i)}
                                        onClick={() => add(item)}>
                                        {renderOption ? (
                                            renderOption(item, isHi)
                                        ) : (
                                            <div>
                                                <div className="font-medium text-app-accent">{getLabel(item)}</div>
                                                {getDescription && <div className="text-xs text-slate-500">{getDescription(item)}</div>}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                    </div>
                )}
            </div>
            {/* Selezionati come pill */}
            {selected.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selected.map((item) => {
                        const id = getId(item);
                        const label = getLabel(item);
                        const desc = getDescription?.(item);
                        return (
                            <span
                                key={id}
                                className="inline-flex items-center gap-2 bg-app-accent text-white text-sm rounded px-2 py-0.5"
                                title={desc}>
                                <span className="text-sm">{label}</span>
                                <button
                                    type="button"
                                    onClick={() => onRemove(id)}
                                    className="text-white hover:text-app-bg focus:outline-none"
                                    aria-label={`Rimuovi ${label}`}>
                                    ×
                                </button>
                            </span>
                        );
                    })}
                </div>
            ) : (
                <div className="text-sm italic text-app-accent p-1">No member associated yet</div>
            )}
        </div>
    );
}
