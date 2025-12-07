"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface BrowsersChartProps {
  browsers: Array<{
    browser: string;
    count: number;
  }>;
  os: Array<{
    os: string;
    count: number;
  }>;
}

const chartConfig = {
  count: {
    label: "Visitantes",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function BrowsersChart({ browsers, os }: BrowsersChartProps) {
  // Combine browsers and OS data
  const browserData = browsers.map((item) => ({
    name: item.browser,
    count: item.count,
    type: "browser",
    fill: "oklch(0.7 0.01 240)",
  }));

  const osData = os.map((item) => ({
    name: item.os,
    count: item.count,
    type: "os",
    fill: "#30DF72",
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Browsers */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium lowercase text-white">
          Navegadores
        </h4>
        {browserData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="h-[200px] w-full aspect-auto"
          >
            <BarChart data={browserData} accessibilityLayer layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" radius={0} />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-neutral-500 lowercase text-sm">sin datos</p>
        )}
      </div>

      {/* Operating Systems */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium lowercase text-white">
          Sistemas Operativos
        </h4>
        {osData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="h-[200px] w-full aspect-auto"
          >
            <BarChart data={osData} accessibilityLayer layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" radius={0} />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-neutral-500 lowercase text-sm">sin datos</p>
        )}
      </div>
    </div>
  );
}
