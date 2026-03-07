 "use client";

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import { SectionHeader } from "@/components/ui/section-header";
import { useTheme } from "@/components/layout/theme-provider";

type Slice = {
  name: string;
  value: number;
};

type Props = {
  title: string;
  subtitle?: string;
  data: Slice[];
};

const COLORS = ["#6C3BFF", "#9F7AEA", "#22C55E", "#FBBF24", "#EF4444"];

export function PieCard({ title, subtitle, data }: Props) {
  const { theme } = useTheme();
  
  const strokeColor = theme === "dark" ? "rgba(15,23,42,0.9)" : "rgba(200,200,220,0.4)";
  const tooltipBg = theme === "dark" ? "#020617" : "#ffffff";
  const tooltipBorder = theme === "dark" ? "rgba(148,163,184,0.5)" : "rgba(148,163,184,0.3)";
  const tooltipTextColor = theme === "dark" ? "#e5e7eb" : "#020617";
  const tooltipItemColor = theme === "dark" ? "#9f7aea" : "#6c3bff";
  const legendTextColor = theme === "dark" ? "rgba(148,163,184,0.9)" : "rgba(15,23,42,0.7)";
  
  return (
    <div className="glass-panel h-72 w-full px-4 py-3.5">
      <SectionHeader title={title} subtitle={subtitle} />
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length]}
                stroke={strokeColor}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              borderRadius: 12,
              border: `1px solid ${tooltipBorder}`,
              padding: "8px 10px",
            }}
            labelStyle={{ color: tooltipTextColor, fontSize: 11 }}
            itemStyle={{ color: tooltipItemColor, fontSize: 11 }}
          />
          <Legend
            verticalAlign="bottom"
            height={24}
            formatter={(value) => (
              <span style={{ color: legendTextColor, fontSize: 11 }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

