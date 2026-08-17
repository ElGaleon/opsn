import {
  Building2,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Home,
  MapPin,
  PanelsTopLeft,
  UserRound,
} from "lucide-react";
import { ReactNode } from "react";
import { DetailHeader } from "@shared/components/DetailHeader";
import { Badge } from "@shared/components/ui/badge";
import { Table, Td, Th } from "@shared/components/ui/table";
import { Contract } from "@shared/lib/api";
import { appTheme } from "@shared/lib/theme";
import { cn, eur, formatDate } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import {
  arrearsAmount,
  paidAmount,
  paymentStatusClass,
  paymentStatusLabel,
} from "@features/movements/utils/movementUtils";
import { unitTypeLabel } from "@features/properties/utils/propertyUtils";

export function ContractDetail({
  data,
  contract,
  onBack,
  onEdit,
}: {
  data: Data;
  contract: Contract;
  onBack: () => void;
  onEdit: () => void;
}) {
  const unit = data.units.find((item) => item.id === contract.unit_id);
  const property = data.properties.find(
    (item) => item.id === unit?.property_id,
  );
  const movements = data.movements.filter(
    (movement) => movement.contract_id === contract.id,
  );
  const payments = movements
    .filter((movement) => movement.type === "income")
    .sort((a, b) =>
      (b.payment_date ?? b.due_date ?? b.accrual_date).localeCompare(
        a.payment_date ?? a.due_date ?? a.accrual_date,
      ),
    );
  const paid = payments
    .reduce((sum, movement) => sum + paidAmount(movement), 0);
  const arrears = payments.reduce(
    (sum, movement) => sum + arrearsAmount(movement),
    0,
  );
  const active =
    !contract.ends_on ||
    contract.ends_on >= new Date().toISOString().slice(0, 10);

  return (
    <div className={appTheme.surface}>
      <DetailHeader
        eyebrow="Dettaglio contratto"
        title={contract.tenant_name}
        subtitle={`${unit?.name ?? "Unità non assegnata"}${property ? ` · ${property.name}` : ""}`}
        onBack={onBack}
        onEdit={onEdit}
      />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Canone mensile"
            value={`${eur.format(Number(contract.monthly_rent))}/mese`}
            status={<StatusBadge status={arrears > 0 ? "unpaid" : "paid"} />}
          />
          <SummaryCard label="Incassato" value={eur.format(paid)} />
          <SummaryCard
            label="Morosità"
            value={eur.format(arrears)}
            tone={arrears > 0 ? "bad" : "good"}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <div className="space-y-5">
            <DetailSection title="Dati contratto">
              <DetailList
                rows={[
                  {
                    icon: <UserRound size={18} />,
                    label: "Inquilino",
                    value: contract.tenant_name,
                  },
                  {
                    icon: <Home size={18} />,
                    label: "Immobile",
                    value: property?.name ?? "—",
                  },
                  {
                    icon: <PanelsTopLeft size={18} />,
                    label: "Unità",
                    value: unit?.name ?? "—",
                  },
                  {
                    icon: <MapPin size={18} />,
                    label: "Indirizzo",
                    value: property?.address ?? "—",
                  },
                  {
                    icon: <Building2 size={18} />,
                    label: "Tipo unità",
                    value: unitTypeLabel(unit?.unit_type) || "—",
                  },
                  {
                    icon: <CheckCircle2 size={18} />,
                    label: "Stato contratto",
                    value: active ? "Attivo" : "Terminato",
                    badge: true,
                  },
                ]}
              />
            </DetailSection>
          </div>

          <div className="space-y-5">
            <DetailSection title="Accordo">
              <DetailList
                rows={[
                  {
                    icon: <CalendarDays size={18} />,
                    label: "Inizio",
                    value: formatDate(contract.starts_on),
                  },
                  {
                    icon: <CalendarCheck2 size={18} />,
                    label: "Fine",
                    value: contract.ends_on ? formatDate(contract.ends_on) : "Aperto",
                  },
                  {
                    icon: <CreditCard size={18} />,
                    label: "Pagamento",
                    value: `Mensile, giorno ${contract.due_day}`,
                  },
                  {
                    icon: <CreditCard size={18} />,
                    label: "Canone mensile",
                    value: eur.format(Number(contract.monthly_rent)),
                  },
                  {
                    icon: <Building2 size={18} />,
                    label: "Deposito",
                    value: eur.format(Number(contract.deposit)),
                  },
                ]}
              />
            </DetailSection>
          </div>
        </div>

        <div className="grid gap-5">
          <DetailSection title="Pagamenti">
            <Table className="min-w-[500px]">
              <thead>
                <tr>
                  <Th>Data</Th>
                  <Th>Importo</Th>
                  <Th>Metodo</Th>
                  <Th>Stato</Th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map((movement) => (
                  <tr key={movement.id}>
                    <Td>
                      {formatDate(
                        movement.payment_date ??
                          movement.due_date ??
                          movement.accrual_date,
                      )}
                    </Td>
                    <Td>
                      {eur.format(
                        Number(movement.paid_amount ?? movement.amount),
                      )}
                    </Td>
                    <Td>{movement.payment_method ?? "—"}</Td>
                    <Td>
                      <StatusBadge status={movement.status} />
                    </Td>
                  </tr>
                ))}
                {!payments.length ? (
                  <tr>
                    <Td colSpan={4}>Nessun pagamento registrato.</Td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className={cn("min-w-0 break-words", appTheme.sectionTitle)}>
          {title}
        </h3>
      </div>
      <div className={appTheme.section}>{children}</div>
    </section>
  );
}

function DetailList({
  rows,
}: {
  rows: {
    icon: ReactNode;
    label: string;
    value: string;
    badge?: boolean;
  }[];
}) {
  return (
    <dl className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={cn(
            "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-stone-200 px-3 py-3 last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] sm:px-4",
            index % 2 === 0 ? "bg-stone-50/70" : "bg-white",
          )}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-stone-600">
            {row.icon}
          </span>
          <dt className="min-w-0 text-sm font-medium text-stone-700">
            {row.label}
          </dt>
          <dd className="col-span-2 min-w-0 break-words text-left text-sm font-semibold text-stone-950 sm:col-span-1 sm:text-right">
            {row.badge ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
                  row.value === "Attivo"
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-stone-100 text-stone-700",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    row.value === "Attivo" ? "bg-emerald-600" : "bg-stone-500",
                  )}
                />
                {row.value}
              </span>
            ) : (
              row.value || "—"
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
  status,
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "bad";
  status?: ReactNode;
}) {
  return (
    <div className={appTheme.softCard}>
      <div className="flex items-center justify-between gap-3">
        <p className={appTheme.label}>{label}</p>
        {status}
      </div>
      <p
        className={cn(
          "mt-2 break-words text-2xl font-semibold leading-tight",
          tone === "good" && "text-emerald-700",
          tone === "bad" && "text-amber-700",
          tone === "default" && "text-stone-950",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={paymentStatusClass(status)}>
      {paymentStatusLabel(status)}
    </Badge>
  );
}
