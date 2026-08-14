import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@shared/components/Field";
import { ListFilters } from "@shared/components/ListFilters";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Stat } from "@shared/components/Stat";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Input } from "@shared/components/ui/input";
import { Select } from "@shared/components/ui/select";
import { Table, Td, Th } from "@shared/components/ui/table";
import { api, Deadline } from "@shared/lib/api";
import { deadlineSchema } from "@shared/schemas/forms";
import { Data } from "@app/types/app";
import { DeadlineFormValues } from "../types/deadlineTypes";

const deadlineValues = (deadline?: Deadline): DeadlineFormValues => ({
  title: deadline?.title ?? "",
  due_date: deadline?.due_date ?? new Date().toISOString().slice(0, 10),
  property_id: deadline?.property_id ?? "",
  unit_id: deadline?.unit_id ?? "",
  status: deadline?.status ?? "open",
});

export function Deadlines({
  data,
  reload,
  getToken,
}: {
  data: Data;
  reload: () => Promise<void>;
  getToken?: () => Promise<string | null>;
}) {
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    undefined,
  );
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const selected = data.deadlines.find(
    (deadline) => deadline.id === selectedId,
  );
  const form = useForm<DeadlineFormValues>({
    resolver: zodResolver(deadlineSchema),
    defaultValues: deadlineValues(selected),
  });

  useEffect(() => {
    form.reset(deadlineValues(selected));
  }, [selectedId, selected?.id]);

  async function save(values: DeadlineFormValues, id?: string) {
    const token = getToken ? await getToken() : null;
    const body = JSON.stringify({
      ...values,
      property_id: values.property_id || null,
      unit_id: values.unit_id || null,
    });
    const saved = await api<Deadline>(
      id ? `/deadlines/${id}` : "/deadlines",
      token,
      { method: id ? "PUT" : "POST", body },
    );
    setSelectedId(saved.id);
    setEditMode(false);
    await reload();
  }

  async function remove() {
    if (!selected) return;
    const token = getToken ? await getToken() : null;
    await api(`/deadlines/${selected.id}`, token, { method: "DELETE" });
    setSelectedId(undefined);
    await reload();
  }

  if (selected && !editMode) {
    const property = data.properties.find(
      (item) => item.id === selected.property_id,
    );
    const unit = data.units.find((item) => item.id === selected.unit_id);
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Dettaglio scadenza</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedId(undefined)}
              >
                <ArrowLeft size={16} /> Indietro
              </Button>
              <Button onClick={() => setEditMode(true)}>
                <Pencil size={16} /> Modifica
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="Scadenza" value={selected.due_date} />
              <Stat
                label="Stato"
                value={selected.status}
                tone={selected.status === "open" ? "bad" : "good"}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <ReadOnly label="Titolo" value={selected.title} />
              <ReadOnly label="Immobile" value={property?.name ?? ""} />
              <ReadOnly label="Unità" value={unit?.name ?? ""} />
              <ReadOnly label="Stato" value={selected.status} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedId !== undefined) {
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>
            {selected ? "Dettaglio scadenza" : "Nuova scadenza"}
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedId(undefined);
              setEditMode(false);
            }}
          >
            <ArrowLeft size={16} /> Indietro
          </Button>
        </CardHeader>
        <CardContent>
          <form
            className="max-w-2xl space-y-3"
            onSubmit={form.handleSubmit((values) => save(values, selected?.id))}
          >
            <Field label="Titolo">
              <Input {...form.register("title")} />
            </Field>
            <Field label="Data">
              <Input type="date" {...form.register("due_date")} />
            </Field>
            <Field label="Immobile">
              <Select {...form.register("property_id")}>
                <option value="">Nessuno</option>
                {data.properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Stato">
              <Select {...form.register("status")}>
                <option value="open">Aperta</option>
                <option value="done">Chiusa</option>
              </Select>
            </Field>
            <div className="flex justify-end gap-2">
              <Button>
                <Plus size={16} /> Salva
              </Button>
              {selected ? (
                <Button type="button" variant="outline" onClick={remove}>
                  <Trash2 size={16} /> Elimina
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  const filteredDeadlines = data.deadlines.filter((deadline) => {
    const property = data.properties.find(
      (item) => item.id === deadline.property_id,
    );
    const unit = data.units.find((item) => item.id === deadline.unit_id);
    const text =
      `${deadline.title} ${property?.name ?? ""} ${unit?.name ?? ""}`.toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (statusFilter === "all" || deadline.status === statusFilter)
    );
  });

  return (
    <SectionPanel
      title="Scadenze"
      actions={
        <Button
          onClick={() => {
            setSelectedId(null);
            setEditMode(true);
          }}
        >
          <Plus size={16} /> Scadenza
        </Button>
      }
      stats={
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat label="Scadenze" value={filteredDeadlines.length} />
          <Stat
            label="Aperte"
            value={
              filteredDeadlines.filter((deadline) => deadline.status === "open")
                .length
            }
            tone="bad"
          />
          <Stat
            label="Chiuse"
            value={
              filteredDeadlines.filter((deadline) => deadline.status === "done")
                .length
            }
            tone="good"
          />
        </div>
      }
      filters={
        <ListFilters
          search={search}
          onSearch={setSearch}
          filters={[
            {
              label: "Stato",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "all", label: "Tutte" },
                { value: "open", label: "Aperte" },
                { value: "done", label: "Chiuse" },
              ],
            },
          ]}
        />
      }
    >
      <Table>
        <thead>
          <tr>
            <Th>Scadenza</Th>
            <Th>Immobile</Th>
            <Th>Unità</Th>
            <Th>Stato</Th>
          </tr>
        </thead>
        <tbody>
          {filteredDeadlines.map((deadline) => (
            <tr
              key={deadline.id}
              className="cursor-pointer hover:bg-emerald-50/70"
              onClick={() => {
                setSelectedId(deadline.id);
                setEditMode(false);
              }}
            >
              <Td>
                {deadline.title}
                <span className="block text-xs text-zinc-500">
                  {deadline.due_date}
                </span>
              </Td>
              <Td>
                {data.properties.find(
                  (property) => property.id === deadline.property_id,
                )?.name ?? "—"}
              </Td>
              <Td>
                {data.units.find((unit) => unit.id === deadline.unit_id)
                  ?.name ?? "—"}
              </Td>
              <Td>{deadline.status}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </SectionPanel>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
