import { ArrowLeft } from "lucide-react";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Button } from "@shared/components/ui/button";
import { Table, Td, Th } from "@shared/components/ui/table";
import { eur } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import { OwnerStats } from "./OwnerStats";

export function OwnerBalancesPanel({
  data,
  total,
  credits,
  debts,
  onBack,
}: {
  data: Data;
  total: number;
  credits: number;
  debts: number;
  onBack: () => void;
}) {
  return (
    <SectionPanel
      title="Saldi proprietari"
      actions={
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} /> Indietro
        </Button>
      }
      stats={<OwnerStats total={total} credits={credits} debts={debts} />}
    >
      <Table>
        <thead>
          <tr>
            <Th>Proprietario</Th>
            <Th>Competenza netta</Th>
            <Th>Cassa reale</Th>
            <Th className="text-right">Saldo</Th>
          </tr>
        </thead>
        <tbody>
          {data.ownerReports.map((row) => (
            <tr key={row.owner_id}>
              <Td>{row.owner}</Td>
              <Td>{eur.format(Number(row.net))}</Td>
              <Td>{eur.format(Number(row.paid_directly))}</Td>
              <Td
                className={`text-right font-medium ${Number(row.owner_balance) >= 0 ? "text-emerald-700" : "text-amber-700"}`}
              >
                {eur.format(Number(row.owner_balance))}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </SectionPanel>
  );
}
