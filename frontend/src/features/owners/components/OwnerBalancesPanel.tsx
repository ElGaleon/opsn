import { ArrowLeft } from "lucide-react";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Button } from "@shared/components/ui/button";
import { Table, Td, Th } from "@shared/components/ui/table";
import { eur } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import { OwnerStats } from "./OwnerStats";
import {
  buildOwnerSettlements,
  ownerBalanceAmount,
  ownerBalanceLabel,
  ownerBalanceTone,
} from "../utils/ownerUtils";

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
  const settlements = buildOwnerSettlements(data.ownerReports);

  return (
    <SectionPanel
      title="Saldi proprietari"
      surface="plain"
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
            <Th className="text-right">Situazione</Th>
          </tr>
        </thead>
        <tbody>
          {data.ownerReports.map((row) => {
            const balance = Number(row.owner_balance);
            return (
              <tr key={row.owner_id}>
                <Td>{row.owner}</Td>
                <Td>{eur.format(Number(row.net))}</Td>
                <Td>{eur.format(Number(row.paid_directly))}</Td>
                <Td
                  className={`text-right font-medium ${
                    ownerBalanceTone(balance) === "bad"
                      ? "text-amber-700"
                      : ownerBalanceTone(balance) === "good"
                        ? "text-emerald-700"
                        : "text-stone-700"
                  }`}
                >
                  {ownerBalanceLabel(balance)}{" "}
                  {eur.format(ownerBalanceAmount(balance))}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <div className="mt-5">
        <h3 className="mb-3 text-base font-semibold text-stone-950">
          Regolazioni suggerite
        </h3>
        <Table>
          <thead>
            <tr>
              <Th>Da</Th>
              <Th>A</Th>
              <Th className="text-right">Importo</Th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((row) => (
              <tr key={`${row.from}-${row.to}-${row.amount}`}>
                <Td className="font-medium text-amber-700">{row.from}</Td>
                <Td className="font-medium text-emerald-700">{row.to}</Td>
                <Td className="text-right font-medium">
                  {eur.format(row.amount)}
                </Td>
              </tr>
            ))}
            {!settlements.length ? (
              <tr>
                <Td colSpan={3}>Nessuna regolazione necessaria.</Td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </div>
    </SectionPanel>
  );
}
