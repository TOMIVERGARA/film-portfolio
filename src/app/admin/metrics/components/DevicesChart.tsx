"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface DevicesChartProps {
  data: {
    desktop_visitors: number;
    mobile_visitors: number;
    mobile_blocked: number;
  };
}

const chartConfig = {
  visitors: {
    label: "Visitantes",
  },
  desktop: {
    label: "Desktop",
    color: "oklch(0.6 0.01 240)",
  },
  mobile: {
    label: "Mobile",
    color: "#30DF72",
  },
  // blocked removed from visual legend/data (we only show desktop vs mobile)
} satisfies ChartConfig;

export function DevicesChart({ data }: DevicesChartProps) {
  const desktopVisitors = Number(data.desktop_visitors) || 0;
  const mobileVisitors = Number(data.mobile_visitors) || 0;

  const chartData = [
    {
      device: "desktop",
      visitors: desktopVisitors,
      fill: "oklch(0.6 0.01 240)",
    },
    {
      device: "mobile",
      visitors: mobileVisitors,
      fill: "#30DF72",
    },
    // mobile_blocked intentionally excluded from chart (show only desktop vs mobile)
  ].filter((item) => item.visitors > 0);

  // Debug: ensure we receive numeric values (check browser console)
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.log("DevicesChart data:", {
      desktopVisitors,
      mobileVisitors,
      chartData,
    });
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] w-full">
        <p className="text-neutral-500 lowercase">sin datos de dispositivos</p>
      </div>
    );
  }

  const total = chartData.reduce((sum, item) => sum + item.visitors, 0);

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[300px] w-full aspect-auto"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="visitors"
          nameKey="device"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={0}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="device" />} />
      </PieChart>
    </ChartContainer>
  );
}
