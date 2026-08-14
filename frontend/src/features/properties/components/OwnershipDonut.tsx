import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Data } from "@app/types/app";

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
}: {
  data: Data;
  propertyId?: string;
  unitId?: string;
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
      <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-stone-200 bg-stone-50 text-sm text-stone-500">
        Nessuna quota assegnata.
      </div>
    );
  }

  return <Chart options={options} series={series} type="donut" height={290} />;
}
