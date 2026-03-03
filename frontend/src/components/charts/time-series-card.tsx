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
            stroke="rgba(148,163,184,0.25)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: "rgba(148,163,184,0.4)", strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: "#020617",
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.5)",
              padding: "8px 10px",
            }}
            labelStyle={{ color: "#e5e7eb", fontSize: 11 }}
            itemStyle={{ color: "#9f7aea", fontSize: 11 }}
            formatter={(value: number) => [`${value.toFixed(0)} ${metricLabel}`, "Value"]}
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

