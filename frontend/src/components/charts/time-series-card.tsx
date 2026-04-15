 "use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SectionHeader } from "@/components/ui/section-header";
import { Activity } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";

type Point = {
  timestamp: string;
  value: number;
};

type Props = {
  title: string;
  subtitle?: string;
  data: Point[];
  gradientFrom?: string;
  gradientTo?: string;
  metricLabel?: string;
};

export function TimeSeriesCard({
  title,
  subtitle,
  data,
  gradientFrom = "#6C3BFF",
  gradientTo = "#9F7AEA",
  metricLabel = "events",
}: Props) {
  const { theme } = useTheme();
  
  const gridColor = theme === "dark" ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.15)";
  const axisColor = theme === "dark" ? "rgba(148,163,184,0.9)" : "rgba(15,23,42,0.7)";
  const cursorColor = theme === "dark" ? "rgba(148,163,184,0.4)" : "rgba(108,59,255,0.3)";
  const tooltipBg = theme === "dark" ? "#020617" : "#ffffff";
  const tooltipBorder = theme === "dark" ? "rgba(148,163,184,0.5)" : "rgba(148,163,184,0.3)";
  const tooltipTextColor = theme === "dark" ? "#e5e7eb" : "#020617";
  const tooltipItemColor = theme === "dark" ? "#9f7aea" : "#6c3bff";
  
  return (
    <div className="glass-panel h-72 w-full px-4 py-3.5">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        icon={<Activity className="h-4 w-4" />}
        rightSlot={<span className="text-[11px]">Last 24h</span>}
      />
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
          <defs>
            <linearGradient id="aegisArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.9} />
              <stop offset="70%" stopColor={gradientTo} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={gridColor}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: axisColor, fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: axisColor, fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: cursorColor, strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: tooltipBg,
              borderRadius: 12,
              border: `1px solid ${tooltipBorder}`,
              padding: "8px 10px",
            }}
            labelStyle={{ color: tooltipTextColor, fontSize: 11 }}
            itemStyle={{ color: tooltipItemColor, fontSize: 11 }}
            formatter={(value) => [`${Number(value ?? 0).toFixed(0)} ${metricLabel}`, "Value"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={gradientFrom}
            strokeWidth={2}
            fill="url(#aegisArea)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

