import { ApexOptions } from "apexcharts";
import { eur } from "@shared/lib/utils";

export const currentYear = new Date().getFullYear();

export const monthNames = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat("it-IT", { month: "short" }).format(
    new Date(currentYear, index, 1),
  ),
);

export const fullMonthLabel = new Intl.DateTimeFormat("it-IT", {
  month: "long",
  year: "numeric",
});

export function baseChartOptions(): ApexOptions {
  return {
    chart: {
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 700,
        animateGradually: { enabled: true, delay: 90 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
      fontFamily: "Inter, ui-sans-serif, system-ui",
    },
    dataLabels: { enabled: false },
    grid: { borderColor: "#dfe9e1", strokeDashArray: 5 },
    legend: { show: false },
    stroke: { curve: "smooth", width: 3 },
    tooltip: {
      theme: "light",
      y: { formatter: (value) => eur.format(Number(value)) },
    },
    xaxis: {
      categories: monthNames,
      labels: { style: { colors: "#78716c" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#78716c" },
        formatter: (value) => eur.format(Number(value)),
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 190 },
          stroke: { width: 2 },
          yaxis: { labels: { show: false } },
        },
      },
    ],
  };
}
