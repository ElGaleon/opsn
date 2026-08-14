import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { OwnerDetail } from "../components/OwnerDetail";
import { OwnerBalancesPanel } from "../components/OwnerBalancesPanel";
import { OwnerForm } from "../components/OwnerForm";
import { OwnerList } from "../components/OwnerList";
import { OwnerStats } from "../components/OwnerStats";
import { OwnerTransferPanel } from "../components/OwnerTransferPanel";
import { api, Movement, Owner } from "@shared/lib/api";
import { ownerSchema, ownerTransferSchema } from "@shared/schemas/forms";
import { Data } from "@app/types/app";
import {
  OwnerFormValues,
  OwnerView,
  TransferFormValues,
} from "../types/ownerTypes";
import {
  filterOwners,
  ownerBalanceStats,
  ownerValues,
} from "../utils/ownerUtils";

export function Owners({
  data,
  reload,
  getToken,
}: {
  data: Data;
  reload: () => Promise<void>;
  getToken?: () => Promise<string | null>;
}) {
  const [view, setView] = useState<OwnerView>({ kind: "list" });
  const [search, setSearch] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("all");
  const owner =
    view.kind === "owner"
      ? data.owners.find((item) => item.id === view.id)
      : undefined;
  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: ownerValues(),
  });
  const transferForm = useForm<TransferFormValues>({
    resolver: zodResolver(ownerTransferSchema),
    defaultValues: {
      from_owner_id: "",
      to_owner_id: "",
      amount: 0,
      transfer_date: new Date().toISOString().slice(0, 10),
      method: "bonifico",
      notes: "",
    },
  });

  useEffect(() => {
    if (view.kind === "owner") form.reset(ownerValues(owner));
  }, [view, owner?.id]);

  async function save(values: OwnerFormValues) {
    const token = getToken ? await getToken() : null;
    const saved = await api<Owner>(
      owner ? `/owners/${owner.id}` : "/owners",
      token,
      {
        method: owner ? "PUT" : "POST",
        body: JSON.stringify(values),
      },
    );
    setView({ kind: "owner", id: saved.id });
    await reload();
  }

  async function remove() {
    if (!owner) return;
    const token = getToken ? await getToken() : null;
    await api(`/owners/${owner.id}`, token, { method: "DELETE" });
    setView({ kind: "list" });
    await reload();
  }

  async function saveTransfer(values: TransferFormValues) {
    const token = getToken ? await getToken() : null;
    await api<Movement>("/movements", token, {
      method: "POST",
      body: JSON.stringify({
        type: "transfer",
        category: "Trasferimento proprietari",
        description: values.notes || "Trasferimento tra proprietari",
        amount: values.amount,
        accrual_date: values.transfer_date,
        payment_date: values.transfer_date,
        status: "paid",
        allocation_mode: "ownership",
        paid_by_owner_id: values.from_owner_id,
        transfer_to_owner_id: values.to_owner_id,
        payment_method: values.method || null,
      }),
    });
    transferForm.reset({ ...values, amount: 0, notes: "" });
    await reload();
    setView({ kind: "list" });
  }

  if (view.kind === "owner") {
    if (owner && view.mode !== "edit") {
      return (
        <OwnerDetail
          data={data}
          owner={owner}
          onBack={() => setView({ kind: "list" })}
          onEdit={() => setView({ ...view, mode: "edit" })}
        />
      );
    }
    return (
      <OwnerForm
        form={form}
        isEditing={Boolean(owner)}
        onBack={() => setView({ kind: "list" })}
        onDelete={remove}
        onSubmit={save}
      />
    );
  }
  if (view.kind === "transfer") {
    return (
      <OwnerTransferPanel
        data={data}
        form={transferForm}
        onBack={() => setView({ kind: "list" })}
        onSubmit={saveTransfer}
      />
    );
  }

  const stats = ownerBalanceStats(data);
  if (view.kind === "balances") {
    return (
      <OwnerBalancesPanel
        data={data}
        total={stats.total}
        credits={stats.credits}
        debts={stats.debts}
        onBack={() => setView({ kind: "list" })}
      />
    );
  }

  return (
    <OwnerList
      data={data}
      owners={filterOwners(data, search, balanceFilter)}
      stats={
        <OwnerStats
          total={stats.total}
          credits={stats.credits}
          debts={stats.debts}
        />
      }
      search={search}
      balanceFilter={balanceFilter}
      onSearch={setSearch}
      onBalanceFilter={setBalanceFilter}
      onNew={() => setView({ kind: "owner" })}
      onTransfer={() => setView({ kind: "transfer" })}
      onBalances={() => setView({ kind: "balances" })}
      onSelect={(id) => setView({ kind: "owner", id, mode: "view" })}
    />
  );
}
