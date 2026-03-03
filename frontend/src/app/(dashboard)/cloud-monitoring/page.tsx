import { TimeSeriesCard } from "@/components/charts/time-series-card";
import { PieCard } from "@/components/charts/pie-card";
import { RadialRiskCard } from "@/components/charts/radial-risk-card";
import { LiveEventFeed, SecurityEvent } from "@/components/layout/live-event-feed";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Globe2 } from "lucide-react";

const anomalySeries = [
  { timestamp: "02:00", value: 4 },
  { timestamp: "04:00", value: 6 },
  { timestamp: "06:00", value: 3 },
  { timestamp: "08:00", value: 8 },
  { timestamp: "10:00", value: 11 },
  { timestamp: "12:00", value: 14 },
  { timestamp: "14:00", value: 9 },
  { timestamp: "16:00", value: 7 },
  { timestamp: "18:00", value: 5 },
  { timestamp: "20:00", value: 6 },
  { timestamp: "22:00", value: 4 },
  { timestamp: "24:00", value: 3 },
];

const loginVsAnomalies = anomalySeries.map((point) => ({
  ...point,
  logins: 240 + Math.round(Math.random() * 60),
}));

const threatTypes = [
  { name: "Impossible Travel", value: 32 },
  { name: "Brute Force", value: 22 },
  { name: "Unusual Login Time", value: 18 },
  { name: "High‑Risk IP", value: 16 },
  { name: "Other", value: 12 },
];

const sampleEvents: SecurityEvent[] = [
  {
    id: "1",
    type: "Brute‑Force",
    severity: "anomaly",
    actor: "unknown‑ip‑443",
    location: "Moscow, RU",
    timeAgo: "47s ago",
    description:
      "116 failed password attempts against admin endpoint; attack automatically tarpitted and IP added to deny‑list.",
  },
  {
    id: "2",
    type: "High‑Risk IP",
    severity: "suspicious",
    actor: "mobile‑idp‑gateway",
    location: "Frankfurt, DE",
    timeAgo: "3m ago",
    description:
      "Successful login from IP recently associated with credential‑stuffing campaigns; enforced step‑up authentication.",
  },
  {
    id: "3",
    type: "Impossible Travel",
    severity: "anomaly",
    actor: "data‑science‑svc",
    location: "Tokyo → Paris (18 min)",
    timeAgo: "9m ago",
    description:
      "Service principal used from two distant regions within 18 minutes; session split and downstream tokens revoked.",
  },
  {
    id: "4",
    type: "Normal Activity",
    severity: "normal",
    actor: "self‑service‑portal",
    location: "Global",
    timeAgo: "14m ago",
    description:
      "Login rates, device posture, and geo‑distribution within normal operating window.",
  },
];

export default function CloudMonitoringPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 pb-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100 md:text-2xl">
            Cloud & Identity Monitoring
          </h1>
          <p className="mt-1 text-xs text-slate-400 md:text-sm">
            Real‑time view into login anomalies, identity risk, and geo‑based
            signals across your cloud perimeter.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="pill border border-slate-700/80 bg-slate-900/40 px-2.5 py-1 text-[11px] text-slate-300">
            Backed by IsolationForest anomaly engine
          </span>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <StatCard
          label="Active Sessions"
          value="1,842"
          helper="Across web, mobile, and service principals."
          tone="default"
        />
        <StatCard
          label="Anomalies (24h)"
          value="127"
          helper="Identity outliers across geo, device, and behavior."
          tone="amber"
        />
        <StatCard
          label="Risk Level"
          value="Medium"
          helper="Most anomalies auto‑remediated; review 9 critical."
          tone="primary"
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <TimeSeriesCard
          title="Anomalies Over Time"
          subtitle="Per‑hour view of identity and access anomalies."
          data={anomalySeries}
          metricLabel="anomalies"
        />
        <div className="space-y-3">
          <RadialRiskCard score={54} />
          <PieCard
            title="Threat Distribution"
            subtitle="Which identity patterns are currently firing."
            data={threatTypes}
          />
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
          <LiveEventFeed events={sampleEvents} />
        </div>
        <div className="glass-panel flex h-80 flex-col px-4 py-3.5">
          <SectionHeader
            title="Geo Activity Snapshot"
            subtitle="World map placeholder; connect your geo‑IP feed."
            icon={<Globe2 className="h-4 w-4" />}
          />
          <div className="relative mt-1 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/40 text-xs text-slate-400">
            <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-primary/5 via-sky-500/5 to-emerald-400/5 blur-[4px]" />
            <p className="relative text-center">
              Geo visualization goes here.
              <br />
              Wire this block to your map provider or internal geo‑IP service.
            </p>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
            {loginVsAnomalies.slice(0, 3).map((row) => (
              <div
                key={row.timestamp}
                className="rounded-xl bg-slate-950/40 px-2.5 py-1.5"
              >
                <p className="font-medium text-slate-200">{row.timestamp}</p>
                <p>Logins: {row.logins}</p>
                <p>Anomalies: {row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

