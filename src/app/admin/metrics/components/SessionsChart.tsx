"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface SessionsChartProps {
  data: Array<{
    date: string;
    sessions: number;
    unique_visitors: number;
  }>;
}

const chartConfig = {
  sessions: {
    label: "Sesiones",
    color: "#30DF72",
  },
  unique_visitors: {
    label: "Visitantes Únicos",
    color: "oklch(0.65 0.01 240)",
  },
} satisfies ChartConfig;

export function SessionsChart({ data }: SessionsChartProps) {
  // Format data for display
  const formattedData = data.map((item) => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    }),
  }));

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[300px] w-full aspect-auto overflow-visible"
    >
      <AreaChart
        data={formattedData}
        accessibilityLayer
        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-sessions)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-sessions)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-unique_visitors)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-unique_visitors)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="dateLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="sessions"
          type="monotone"
          fill="url(#fillSessions)"
          fillOpacity={0.4}
          stroke="var(--color-sessions)"
          strokeWidth={2}
        />
        <Area
          dataKey="unique_visitors"
          type="monotone"
          fill="url(#fillVisitors)"
          fillOpacity={0.4}
          stroke="var(--color-unique_visitors)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
