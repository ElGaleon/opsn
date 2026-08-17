import { Plus, UserRound, WalletCards } from "lucide-react";
import { ReactNode } from "react";
import { ListFilters } from "@shared/components/ListFilters";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { Table, Td, Th } from "@shared/components/ui/table";
import { Owner } from "@shared/lib/api";
import { eur } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import {
  ownerBalanceAmount,
  ownerBalanceLabel,
  ownerBalanceTone,
} from "../utils/ownerUtils";

export function OwnerList({
  data,
  owners,
  stats,
  search,
  balanceFilter,
  onSearch,
  onBalanceFilter,
  onNew,
  onTransfer,
  onBalances,
  onSelect,
}: {
  data: Data;
  owners: Owner[];
  stats?: ReactNode;
  search: string;
  balanceFilter: string;
  onSearch: (value: string) => void;
  onBalanceFilter: (value: string) => void;
  onNew: () => void;
  onTransfer: () => void;
  onBalances: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <SectionPanel
      title="Proprietari"
      surface="plain"
      actions={
        <>
          <Button variant="outline" onClick={onBalances}>
            <WalletCards size={16} /> Vedi saldi
          </Button>
          <Button variant="outline" onClick={onTransfer}>
            <Plus size={16} /> Trasferimento
          </Button>
          <Button onClick={onNew}>
            <Plus size={16} /> Proprietario
          </Button>
        </>
      }
      stats={stats}
      filters={
        <ListFilters
          search={search}
          onSearch={onSearch}
          filters={[
            {
              label: "Filtro saldo",
              value: balanceFilter,
              onChange: onBalanceFilter,
              options: [
                { value: "all", label: "Tutti" },
                { value: "credit", label: "Da ricevere" },
                { value: "debt", label: "Da versare" },
              ],
            },
          ]}
        />
      }
    >
      <Table>
        <thead>
          <tr>
            <Th>Proprietario</Th>
            <Th>Saldo</Th>
            <Th>Quote</Th>
            <Th>Previsione</Th>
          </tr>
        </thead>
        <tbody>
          {owners.map((owner) => {
            const report = data.ownerReports.find(
              (item) => item.owner_id === owner.id,
            );
            const forecast = data.forecast?.owners.find(
              (item) => item.owner_id === owner.id,
            );
            const balance = Number(report?.owner_balance ?? 0);
            return (
              <tr
                key={owner.id}
                className="cursor-pointer hover:bg-emerald-50/70"
                onClick={() => onSelect(owner.id)}
              >
                <Td>
                  <UserRound className="mr-2 inline" size={16} />
                  {owner.first_name} {owner.last_name}
                </Td>
                <Td
                  className={
                    ownerBalanceTone(balance) === "bad"
                      ? "text-amber-700"
                      : ownerBalanceTone(balance) === "good"
                        ? "text-emerald-700"
                        : "text-stone-700"
                  }
                >
                  <span className="font-medium">
                    {ownerBalanceLabel(balance)}
                  </span>{" "}
                  {eur.format(ownerBalanceAmount(balance))}
                </Td>
                <Td>
                  <Badge>
                    {
                      data.shares.filter((share) => share.owner_id === owner.id)
                        .length
                    }
                  </Badge>
                </Td>
                <Td>{eur.format(Number(forecast?.net_due ?? 0))}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </SectionPanel>
  );
}
