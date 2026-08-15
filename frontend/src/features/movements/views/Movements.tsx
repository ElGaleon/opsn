import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MovementDetail } from "../components/MovementDetail";
import { MovementForm } from "../components/MovementForm";
import { MovementList } from "../components/MovementList";
import { api, Movement } from "@shared/lib/api";
import { notifyInvalidSubmit } from "@shared/lib/toast";
import { movementSchema } from "@shared/schemas/forms";
import { Data } from "@app/types/app";
import { MovementFormValues } from "../types/movementTypes";
import { filterMovements } from "../utils/movementUtils";

const emptyMovement = (propertyId = ""): MovementFormValues => ({
  property_id: propertyId,
  type: "income",
  category: "Affitto",
  description: "",
  amount: 0,
  paid_amount: undefined,
  accrual_date: new Date().toISOString().slice(0, 10),
  status: "unpaid",
  allocation_mode: "ownership",
  paid_by_owner_id: "",
  transfer_to_owner_id: "",
  payment_method: "",
});

export function Movements({
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
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customAllocations, setCustomAllocations] = useState<
    Record<string, number>
  >({});
  const selected = data.movements.find(
    (movement) => movement.id === selectedId,
  );
  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: emptyMovement(data.properties[0]?.id),
  });

  useEffect(() => {
    if (data.properties[0] && !form.getValues("property_id"))
      form.setValue("property_id", data.properties[0].id);
  }, [data.properties]);

  useEffect(() => {
    if (!selected) {
      if (selectedId === null)
        form.reset(emptyMovement(data.properties[0]?.id));
      return;
    }
    form.reset({
      property_id: selected.property_id ?? "",
      unit_id: selected.unit_id ?? "",
      type: selected.type,
      category: selected.category,
      description: selected.description,
      amount: Number(selected.amount),
      accrual_date: selected.accrual_date,
      due_date: selected.due_date ?? "",
      payment_date: selected.payment_date ?? "",
      status: selected.status,
      allocation_mode: selected.allocation_mode,
      paid_by_owner_id: selected.paid_by_owner_id ?? "",
      transfer_to_owner_id: selected.transfer_to_owner_id ?? "",
      payment_method: selected.payment_method ?? "",
      paid_amount: undefined,
    });
    setCustomAllocations(
      selected.allocation_mode === "custom"
        ? Object.fromEntries(
            selected.allocations.map((allocation) => [
              allocation.owner_id,
              Number(allocation.percentage),
            ]),
          )
        : {},
    );
  }, [selectedId, selected?.id]);

  async function submit(values: MovementFormValues) {
    const token = getToken ? await getToken() : null;
    const payload = {
      ...values,
      property_id:
        values.type === "transfer" ? null : values.property_id || null,
      unit_id: values.type === "transfer" ? null : values.unit_id || null,
      due_date: values.due_date || null,
      payment_date:
        values.payment_date ||
        (values.type === "transfer" ? values.accrual_date : null),
      status: values.type === "transfer" ? "paid" : values.status,
      paid_by_owner_id: values.paid_by_owner_id || null,
      transfer_to_owner_id: values.transfer_to_owner_id || null,
      payment_method: values.payment_method || null,
      allocations:
        values.allocation_mode === "custom"
          ? Object.entries(customAllocations)
              .filter(([, percentage]) => percentage > 0)
              .map(([owner_id, percentage]) => ({ owner_id, percentage }))
          : [],
    };
    const saved = await api<Movement>(
      selected ? `/movements/${selected.id}` : "/movements",
      token,
      { method: selected ? "PUT" : "POST", body: JSON.stringify(payload) },
    );
    setSelectedId(saved.id);
    setEditMode(false);
    await reload();
  }

  async function remove() {
    if (!selected) return;
    const token = getToken ? await getToken() : null;
    await api(`/movements/${selected.id}`, token, { method: "DELETE" });
    setSelectedId(undefined);
    await reload();
  }

  if (selected && !editMode) {
    return (
      <MovementDetail
        data={data}
        movement={selected}
        onBack={() => setSelectedId(undefined)}
        onEdit={() => setEditMode(true)}
      />
    );
  }

  if (selectedId !== undefined) {
    return (
      <MovementForm
        data={data}
        form={form}
        isEditing={Boolean(selected)}
        customAllocations={customAllocations}
        onCustomAllocations={setCustomAllocations}
        onBack={() => {
          setSelectedId(undefined);
          setEditMode(false);
        }}
        onDelete={remove}
        onSubmit={submit}
        onInvalid={notifyInvalidSubmit}
      />
    );
  }

  return (
    <MovementList
      data={data}
      movements={filterMovements(data, search, typeFilter, statusFilter)}
      search={search}
      typeFilter={typeFilter}
      statusFilter={statusFilter}
      onSearch={setSearch}
      onTypeFilter={setTypeFilter}
      onStatusFilter={setStatusFilter}
      onNew={() => {
        setSelectedId(null);
        setEditMode(true);
      }}
      onSelect={(id) => {
        setSelectedId(id);
        setEditMode(false);
      }}
    />
  );
}
