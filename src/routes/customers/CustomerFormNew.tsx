import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCreateCustomer } from "@/modules/customers/api.vercel";
import type { Customer } from "@/modules/customers/types";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";

export function CustomerFormNew() {
    const nav = useNavigate();

    const [customer, setCustomer] = useState<Customer>({
        id: "",
        title: "",
        description: "",
    });
    const [pending, setPending] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPending(true);
        setErr(null);
        try {
            await apiCreateCustomer(customer);
            nav("/customers");
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore salvataggio";
            setErr(message);
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="max-w-xl space-y-4">
            <h1 className="text-2xl font-semibold">New project</h1>

            <form
                onSubmit={onSubmit}
                className="space-y-3">
                <div>
                    <InputField
                        label="Title"
                        value={customer.title}
                        onChange={(e) => setCustomer({ ...customer, title: e.target.value })}
                    />
                </div>

                <div>
                    <TextAreaField
                        label="Description"
                        rows={4}
                        value={customer.description ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomer({ ...customer, description: e.target.value })}
                    />
                </div>

                {err && <p className="text-red-600 text-sm">{err}</p>}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        className="text-2xl font-semibold"
                        onClick={() => nav(-1)}
                        variant="outline">
                        Cancel
                    </Button>
                    <Button
                        disabled={pending}
                        variant="primary">
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}
