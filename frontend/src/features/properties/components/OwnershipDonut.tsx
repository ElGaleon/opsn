import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Plus } from "lucide-react";
import { Data } from "@app/types/app";
import { Button } from "@shared/components/ui/button";

const colors = [
  "#087f5b",
  "#21b37b",
  "#d97706",
  "#c7f9b4",
  "#57534e",
  "#a3e635",
];

export function OwnershipDonut({
  data,
  propertyId,
  unitId,
  onEdit,
}: {
  data: Data;
  propertyId?: string;
  unitId?: string;
  onEdit?: () => void;
}) {
  const shares = data.shares.filter(
    (share) =>
      (unitId ? share.unit_id === unitId : share.property_id === propertyId) &&
      !share.valid_to,
  );
  const series = shares.map((share) => Number(share.percentage));
  const labels = shares.map((share) => {
    const owner = data.owners.find((item) => item.id === share.owner_id);
    return owner ? `${owner.first_name} ${owner.last_name}` : "Proprietario";
  });
  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      animations: { enabled: true, speed: 600 },
      fontFamily: "Inter, ui-sans-serif, system-ui",
    },
    colors,
    dataLabels: { enabled: false },
    labels,
    legend: {
      position: "bottom",
      fontSize: "12px",
      labels: { colors: "#57534e" },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Totale",
              formatter: () =>
                `${series.reduce((sum, value) => sum + value, 0)}%`,
            },
          },
        },
      },
    },
    stroke: { colors: ["#fff"], width: 3 },
    tooltip: { y: { formatter: (value) => `${value}%` } },
  };

  if (!shares.length) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-emerald-950/15 bg-emerald-50/30 p-6 text-center text-sm text-stone-500">
        <p>Nessuna quota assegnata.</p>
        <Button type="button" variant="outline" onClick={onEdit}>
          <Plus size={16} /> Assegna quote
        </Button>
      </div>
    );
  }

  return <Chart options={options} series={series} type="donut" height={290} />;
}
