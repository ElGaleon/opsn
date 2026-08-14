import { useMemo, useState } from "react";
import { ListFilters } from "@shared/components/ListFilters";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Stat } from "@shared/components/Stat";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Table, Td, Th } from "@shared/components/ui/table";
import { api, Forecast } from "@shared/lib/api";
import { eur } from "@shared/lib/utils";
import { Data } from "@app/types/app";

export function Reports({
  data,
  getToken,
}: {
  data: Data;
  getToken?: () => Promise<string | null>;
}) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [startMonth, setStartMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [months, setMonths] = useState(12);
  const [propertySearch, setPropertySearch] = useState("");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [forecastSearch, setForecastSearch] = useState("");
  const shownForecast = forecast ?? data.forecast;
  const byProperty = useMemo(
    () =>
      data.properties.map((property) => {
        const movements = data.movements.filter(
          (movement) => movement.property_id === property.id,
        );
        const income = movements
          .filter((movement) => movement.type === "income")
          .reduce((sum, movement) => sum + Number(movement.amount), 0);
        const expenses = movements
          .filter((movement) => movement.type === "expense")
          .reduce((sum, movement) => sum + Number(movement.amount), 0);
        return { property, income, expenses, net: income - expenses };
      }),
    [data.properties, data.movements],
  );
  const filteredProperties = byProperty.filter((row) =>
    row.property.name.toLowerCase().includes(propertySearch.toLowerCase()),
  );
  const filteredOwners = data.ownerReports.filter((row) =>
    row.owner.toLowerCase().includes(ownerSearch.toLowerCase()),
  );
  const filteredForecastMonths =
    shownForecast?.months.filter((row) =>
      row.month.includes(forecastSearch.toLowerCase()),
    ) ?? [];
  const filteredForecastOwners =
    shownForecast?.owners.filter((row) =>
      row.owner.toLowerCase().includes(forecastSearch.toLowerCase()),
    ) ?? [];
  const propertyTotals = filteredProperties.reduce(
    (sum, row) => ({
      income: sum.income + row.income,
      expenses: sum.expenses + row.expenses,
      net: sum.net + row.net,
    }),
    { income: 0, expenses: 0, net: 0 },
  );
  const ownerTotals = filteredOwners.reduce(
    (sum, row) => {
      const balance = Number(row.owner_balance);
      return {
        credits: sum.credits + (balance > 0 ? balance : 0),
        debts: sum.debts + (balance < 0 ? Math.abs(balance) : 0),
        balance: sum.balance + balance,
      };
    },
    { credits: 0, debts: 0, balance: 0 },
  );
  const forecastMonthTotals = filteredForecastMonths.reduce(
    (sum, row) => ({
      income: sum.income + Number(row.income_due),
      expenses: sum.expenses + Number(row.expense_due),
      net: sum.net + Number(row.net_due),
    }),
    { income: 0, expenses: 0, net: 0 },
  );
  const forecastOwnerTotals = filteredForecastOwners.reduce(
    (sum, row) => ({
      income: sum.income + Number(row.income_due),
      expenses: sum.expenses + Number(row.expense_due),
      net: sum.net + Number(row.net_due),
    }),
    { income: 0, expenses: 0, net: 0 },
  );

  async function loadForecast() {
    const token = getToken ? await getToken() : null;
    setForecast(
      await api<Forecast>(
        `/reports/forecast?start_month=${startMonth}&months=${months}`,
        token,
      ),
    );
  }

  return (
    <div className="space-y-5">
      <SectionPanel
        title="Conto economico per immobile"
        stats={
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Stat
              label="Entrate"
              value={eur.format(propertyTotals.income)}
              tone="good"
            />
            <Stat
              label="Uscite"
              value={eur.format(propertyTotals.expenses)}
              tone="bad"
            />
            <Stat
              label="Netto"
              value={eur.format(propertyTotals.net)}
              tone={propertyTotals.net >= 0 ? "good" : "bad"}
            />
          </div>
        }
        filters={
          <ListFilters
            search={propertySearch}
            onSearch={setPropertySearch}
            placeholder="Cerca immobile..."
          />
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Immobile</Th>
              <Th>Entrate</Th>
              <Th>Uscite</Th>
              <Th>Netto</Th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.map((row) => (
              <tr key={row.property.id}>
                <Td>{row.property.name}</Td>
                <Td>{eur.format(row.income)}</Td>
                <Td>{eur.format(row.expenses)}</Td>
                <Td
                  className={row.net >= 0 ? "text-emerald-700" : "text-red-700"}
                >
                  {eur.format(row.net)}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </SectionPanel>
      <SectionPanel
        title="Saldo proprietari"
        stats={
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Stat
              label="Saldo"
              value={eur.format(ownerTotals.balance)}
              tone={ownerTotals.balance >= 0 ? "good" : "bad"}
            />
            <Stat
              label="Crediti"
              value={eur.format(ownerTotals.credits)}
              tone="good"
            />
            <Stat
              label="Debiti"
              value={eur.format(ownerTotals.debts)}
              tone="bad"
            />
          </div>
        }
        filters={
          <ListFilters
            search={ownerSearch}
            onSearch={setOwnerSearch}
            placeholder="Cerca proprietario..."
          />
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Proprietario</Th>
              <Th>Competenza netta</Th>
              <Th>Cassa reale</Th>
              <Th>Saldo</Th>
            </tr>
          </thead>
          <tbody>
            {filteredOwners.map((row) => (
              <tr key={row.owner_id}>
                <Td>{row.owner}</Td>
                <Td>{eur.format(Number(row.net))}</Td>
                <Td>{eur.format(Number(row.paid_directly))}</Td>
                <Td>{eur.format(Number(row.owner_balance))}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </SectionPanel>
      <SectionPanel
        title="Previsione competenza"
        stats={
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Stat
              label="Entrate"
              value={eur.format(forecastMonthTotals.income)}
              tone="good"
            />
            <Stat
              label="Uscite"
              value={eur.format(forecastMonthTotals.expenses)}
              tone="bad"
            />
            <Stat
              label="Netto"
              value={eur.format(forecastMonthTotals.net)}
              tone={forecastMonthTotals.net >= 0 ? "good" : "bad"}
            />
          </div>
        }
        filters={
          <div className="grid gap-2 sm:grid-cols-[150px_90px_minmax(220px,1fr)_auto]">
            <Input
              type="month"
              value={startMonth}
              onChange={(event) => setStartMonth(event.target.value)}
            />
            <Input
              type="number"
              min="1"
              max="60"
              value={months}
              onChange={(event) => setMonths(Number(event.target.value))}
            />
            <ListFilters
              search={forecastSearch}
              onSearch={setForecastSearch}
              placeholder="Cerca mese o proprietario..."
            />
            <Button onClick={loadForecast}>Aggiorna</Button>
          </div>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Mese</Th>
              <Th>Entrate spettanti</Th>
              <Th>Uscite spettanti</Th>
              <Th>Netto previsto</Th>
            </tr>
          </thead>
          <tbody>
            {filteredForecastMonths.map((row) => (
              <tr key={row.month}>
                <Td>{row.month}</Td>
                <Td>{eur.format(Number(row.income_due))}</Td>
                <Td>{eur.format(Number(row.expense_due))}</Td>
                <Td
                  className={
                    Number(row.net_due) >= 0
                      ? "text-emerald-700"
                      : "text-red-700"
                  }
                >
                  {eur.format(Number(row.net_due))}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </SectionPanel>
      <SectionPanel
        title="Previsione per proprietario"
        stats={
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Stat label="Proprietari" value={filteredForecastOwners.length} />
            <Stat
              label="Entrate"
              value={eur.format(forecastOwnerTotals.income)}
              tone="good"
            />
            <Stat
              label="Netto"
              value={eur.format(forecastOwnerTotals.net)}
              tone={forecastOwnerTotals.net >= 0 ? "good" : "bad"}
            />
          </div>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Proprietario</Th>
              <Th>Entrate spettanti</Th>
              <Th>Uscite spettanti</Th>
              <Th>Netto previsto</Th>
            </tr>
          </thead>
          <tbody>
            {filteredForecastOwners.map((row) => (
              <tr key={row.owner_id}>
                <Td>{row.owner}</Td>
                <Td>{eur.format(Number(row.income_due))}</Td>
                <Td>{eur.format(Number(row.expense_due))}</Td>
                <Td
                  className={
                    Number(row.net_due) >= 0
                      ? "text-emerald-700"
                      : "text-red-700"
                  }
                >
                  {eur.format(Number(row.net_due))}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </SectionPanel>
    </div>
  );
}
