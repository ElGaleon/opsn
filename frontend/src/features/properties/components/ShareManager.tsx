import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@shared/components/Field";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { api, Share } from "@shared/lib/api";
import { shareSetSchema } from "@shared/schemas/forms";
import { Data } from "@app/types/app";
import { ShareFormValues } from "../types/propertyTypes";

export function ShareManager({
  data,
  propertyId,
  unitId,
  reload,
  getToken,
}: {
  data: Data;
  propertyId?: string;
  unitId?: string;
  reload: () => Promise<void>;
  getToken?: () => Promise<string | null>;
}) {
  const [editing, setEditing] = useState(false);
  const targetShares = data.shares.filter((share) =>
    unitId ? share.unit_id === unitId : share.property_id === propertyId,
  );
  const current = targetShares.filter((share) => !share.valid_to);
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const form = useForm<ShareFormValues>({
    resolver: zodResolver(shareSetSchema),
    defaultValues: {
      valid_from: new Date().toISOString().slice(0, 10),
      valid_to: "",
    },
  });
  const total = Object.values(percentages).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  useEffect(() => {
    setPercentages(
      Object.fromEntries(
        current.map((share) => [share.owner_id, Number(share.percentage)]),
      ),
    );
  }, [targetShares.map((share) => share.id).join(",")]);

  async function save(values: ShareFormValues) {
    const token = getToken ? await getToken() : null;
    await api<Share[]>("/ownership-shares/set", token, {
      method: "POST",
      body: JSON.stringify({
        property_id: unitId ? null : propertyId,
        unit_id: unitId ?? null,
        valid_from: values.valid_from,
        valid_to: values.valid_to || null,
        shares: Object.entries(percentages)
          .filter(([, percentage]) => percentage > 0)
          .map(([owner_id, percentage]) => ({ owner_id, percentage })),
      }),
    });
    setEditing(false);
    await reload();
  }

  if (!editing) {
    return (
      <div className="space-y-2">
        {targetShares.map((share) => {
          const owner = data.owners.find((item) => item.id === share.owner_id);
          return (
            <div
              key={share.id}
              className="rounded-md border border-zinc-200 p-3 text-sm"
            >
              {owner
                ? `${owner.first_name} ${owner.last_name}`
                : "Proprietario"}{" "}
              · {share.percentage}% · dal {share.valid_from}
              {share.valid_to ? ` al ${share.valid_to}` : ""}
            </div>
          );
        })}
        {!targetShares.length ? (
          <p className="text-sm text-zinc-500">Nessuna quota assegnata.</p>
        ) : null}
        <Button variant="outline" onClick={() => setEditing(true)}>
          <Plus size={16} /> Assegna quote
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-3" onSubmit={form.handleSubmit(save)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Valide dal">
          <Input type="date" {...form.register("valid_from")} />
        </Field>
        <Field label="Valide al">
          <Input type="date" {...form.register("valid_to")} />
        </Field>
      </div>
      <div className="space-y-2">
        {data.owners.map((owner) => (
          <div
            key={owner.id}
            className="grid grid-cols-[1fr_110px] items-center gap-3"
          >
            <span className="text-sm">
              {owner.first_name} {owner.last_name}
            </span>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={percentages[owner.id] ?? 0}
              onChange={(event) =>
                setPercentages((values) => ({
                  ...values,
                  [owner.id]: Number(event.target.value),
                }))
              }
            />
          </div>
        ))}
      </div>
      <p
        className={`text-right text-xs ${total === 100 ? "text-emerald-700" : "text-red-700"}`}
      >
        Totale {total}%
      </p>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditing(false)}
        >
          Annulla
        </Button>
        <Button disabled={total !== 100}>
          <Plus size={16} /> Salva quote
        </Button>
      </div>
    </form>
  );
}
