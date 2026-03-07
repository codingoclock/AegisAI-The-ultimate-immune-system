 "use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { SectionHeader } from "@/components/ui/section-header";

type Props = {
  score: number; // 0-100
};

export function RadialRiskCard({ score }: Props) {
  const level =
    score < 30 ? "Low" : score < 70 ? "Medium" : "High";
  const color =
    score < 30 ? "#22C55E" : score < 70 ? "#FBBF24" : "#EF4444";

  const data = [{ name: "Risk", value: score, fill: color }];

  return (
    <div className="glass-panel h-72 w-full px-4 py-3.5">
      <SectionHeader
        title="Risk Score"
        subtitle="Blended model + identity risk index"
      />
      <div className="flex h-[80%] items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            barSize={14}
            data={data}
            startAngle={220}
            endAngle={-40}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              dataKey="value"
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={50}
              fill={color}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="pointer-events-none -mt-24 flex flex-col items-center justify-center text-center">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-foreground/60">
          Current Risk
        </p>
        <p className="mt-1 text-3xl font-semibold text-foreground">
          {score.toFixed(0)}
        </p>
        <p className="mt-1 text-xs text-foreground/70">{level} · last 15 minutes</p>
      </div>
    </div>
  );
}

