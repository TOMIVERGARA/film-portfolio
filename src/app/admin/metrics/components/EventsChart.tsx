"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface EventsChartProps {
  events: Array<{
    event_type: string;
    event_category: string;
    count: number;
  }>;
}

const chartConfig = {
  count: {
    label: "Eventos",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function EventsChart({ events }: EventsChartProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] w-full">
        <p className="text-neutral-500 lowercase">no hay eventos registrados</p>
      </div>
    );
  }

  const chartData = events.slice(0, 10).map((event) => ({
    name: event.event_type.replace(/_/g, " "),
    count: event.count,
    fill: "oklch(0.65 0.01 240)",
  }));

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[300px] w-full aspect-auto"
    >
      <BarChart data={chartData} accessibilityLayer layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          width={120}
          tickMargin={8}
        />
        <ChartTooltip
          content={<ChartTooltipContent hideLabel />}
          cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
        />
        <Bar dataKey="count" radius={0} />
      </BarChart>
    </ChartContainer>
  );
}
