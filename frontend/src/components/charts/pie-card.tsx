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
                stroke="rgba(15,23,42,0.9)"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.5)",
              padding: "8px 10px",
            }}
            labelStyle={{ color: "#e5e7eb", fontSize: 11 }}
            itemStyle={{ color: "#9f7aea", fontSize: 11 }}
          />
          <Legend
            verticalAlign="bottom"
            height={24}
            formatter={(value) => (
              <span style={{ color: "rgba(148,163,184,0.9)", fontSize: 11 }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

