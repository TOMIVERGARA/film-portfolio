"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface PerformanceChartProps {
  data: {
    avg_page_load: number;
    avg_canvas_init: number;
    avg_first_photo: number;
    avg_photo_load: number;
  };
}

const chartConfig = {
  time: {
    label: "Tiempo (ms)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = [
    {
      metric: "Carga Página",
      time: data.avg_page_load || 0,
      fill: "#30DF72",
    },
    {
      metric: "Init Canvas",
      time: data.avg_canvas_init || 0,
      fill: "oklch(0.7 0.01 240)",
    },
    {
      metric: "Primera Foto",
      time: data.avg_first_photo || 0,
      fill: "oklch(0.6 0.01 240)",
    },
    {
      metric: "Promedio Fotos",
      time: data.avg_photo_load || 0,
      fill: "oklch(0.5 0.01 240)",
    },
  ];

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[300px] w-full aspect-auto"
    >
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="metric"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          angle={-20}
          textAnchor="end"
          height={80}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value}ms`}
        />
        <ChartTooltip
          content={<ChartTooltipContent hideLabel />}
          cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
        />
        <Bar dataKey="time" radius={0} />
      </BarChart>
    </ChartContainer>
  );
}
