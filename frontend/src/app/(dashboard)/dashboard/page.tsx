import { StatCard } from "@/components/ui/stat-card";
import { TimeSeriesCard } from "@/components/charts/time-series-card";
import { PieCard } from "@/components/charts/pie-card";
import { RadialRiskCard } from "@/components/charts/radial-risk-card";
import { LiveEventFeed, SecurityEvent } from "@/components/layout/live-event-feed";
import { Brain, Cloud, ShieldAlert, Zap } from "lucide-react";

const overviewMetrics = [
  {
    label: "AI Attacks Blocked",
    value: "1,284",
    helper: "Adversarial inputs rejected in the last 7 days.",
    tone: "primary" as const,
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
  },
  {
    label: "Identity Threats Detected",
    value: "672",
    helper: "Impossible travel, brute force, and high‑risk IPs.",
    tone: "amber" as const,
    icon: <Cloud className="h-3.5 w-3.5" />,
  },
  {
    label: "System Health",
    value: "98.7%",
    helper: "Composite health across models, APIs, and queues.",
    tone: "green" as const,
    icon: <Brain className="h-3.5 w-3.5" />,
  },
  {
    label: "Median Inference Latency",
    value: "54 ms",
    helper: "End‑to‑end model inference time (p50).",
    tone: "default" as const,
    icon: <Zap className="h-3.5 w-3.5" />,
  },
];

const activitySeries = [
  { timestamp: "02:00", value: 32 },
  { timestamp: "04:00", value: 44 },
  { timestamp: "06:00", value: 51 },
  { timestamp: "08:00", value: 60 },
  { timestamp: "10:00", value: 74 },
  { timestamp: "12:00", value: 90 },
  { timestamp: "14:00", value: 76 },
  { timestamp: "16:00", value: 80 },
  { timestamp: "18:00", value: 71 },
  { timestamp: "20:00", value: 58 },
  { timestamp: "22:00", value: 40 },
  { timestamp: "24:00", value: 36 },
];

const threatDistribution = [
  { name: "Model Attacks", value: 34 },
  { name: "Identity Anomalies", value: 28 },
  { name: "API Abuse", value: 18 },
  { name: "Network Edge", value: 12 },
  { name: "Other", value: 8 },
];

const sampleEvents: SecurityEvent[] = [
  {
    id: "1",
    type: "Impossible Travel",
    severity: "anomaly",
    actor: "svc-marketing@corp",
    location: "São Paulo → Frankfurt (12 min)",
    timeAgo: "23s ago",
    description:
      "OAuth service account logged in from BR and DE within 12 minutes; geo‑velocity exceeds baseline by 4.7x.",
  },
  {
    id: "2",
    type: "Unusual Login Time",
    severity: "suspicious",
    actor: "jane.doe",
    location: "San Francisco, US",
    timeAgo: "3m ago",
    description:
      "Admin console accessed outside normal working window (02:41 local); MFA verified but device fingerprint new.",
  },
  {
    id: "3",
    type: "Adversarial Image Blocked",
    severity: "anomaly",
    actor: "edge‑ingest‑01",
    location: "us‑central‑1",
    timeAgo: "8m ago",
    description:
      "ResNet‑18 robust head detected adversarial pattern (PGD‑like) and routed image through hardened path.",
  },
  {
    id: "4",
    type: "Normal API Activity",
    severity: "normal",
    actor: "public‑client‑web",
    location: "Global",
    timeAgo: "11m ago",
    description:
      "Traffic volume and latency within expected bands; no abnormal error spikes or auth anomalies.",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 pb-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100 md:text-2xl">
            Unified Security Overview
          </h1>
          <p className="mt-1 text-xs text-slate-400 md:text-sm">
            Executive snapshot across AI models, cloud identities, and anomaly
            streams. All signals, one immune system.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="pill flex items-center gap-1.5 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/60">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live ingest
          </span>
          <span className="pill border border-border-subtle bg-surface/40 px-2.5 py-1 text-[11px] text-foreground">
            Synthetic data · FastAPI connected later
          </span>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {overviewMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TimeSeriesCard
            title="Security Activity Over Time"
            subtitle="Combined view of blocked attacks, anomalies, and policy decisions."
            data={activitySeries}
            metricLabel="events"
          />
        </div>
        <div className="space-y-3">
          <RadialRiskCard score={38} />
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PieCard
            title="Threat Distribution"
            subtitle="What AegisAI is protecting you from right now."
            data={threatDistribution}
          />
        </div>
        <div className="lg:col-span-2">
          <LiveEventFeed events={sampleEvents} />
        </div>
      </section>
    </div>
  );
}

