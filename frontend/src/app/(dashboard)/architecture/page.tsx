import { SectionHeader } from "@/components/ui/section-header";
import { Brain, Boxes, Cloud, Shield, Workflow } from "lucide-react";

const blocks = [
  {
    title: "Data Sources",
    icon: <Cloud className="h-4 w-4" />,
    description:
      "App telemetry, login events, image uploads, and API traces streaming from your infrastructure.",
    bullets: ["Login & identity events", "Model inputs & outputs", "Audit & API logs"],
  },
  {
    title: "FastAPI Backend",
    icon: <Workflow className="h-4 w-4" />,
    description:
      "Orchestrates model inference, anomaly scoring, and routing of security signals into AegisAI.",
    bullets: ["FastAPI services", "Auth & RBAC", "Event fan‑out & queues"],
  },
  {
    title: "AI Models",
    icon: <Brain className="h-4 w-4" />,
    description:
      "ResNet‑18 hardened with adversarial training plus IsolationForest‑based identity anomaly detection.",
    bullets: ["Robust vision models", "IsolationForest identity engine", "Risk scoring pipelines"],
  },
  {
    title: "AegisAI Frontend",
    icon: <Shield className="h-4 w-4" />,
    description:
      "Next.js 14 dashboard that visualizes security posture in real‑time with charts, feeds, and controls.",
    bullets: ["Next.js App Router", "Recharts & TailwindCSS", "Role‑aware views"],
  },
];

export default function ArchitecturePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 pb-2">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 md:text-2xl">
          Architecture
        </h1>
        <p className="mt-1 text-xs text-slate-400 md:text-sm">
          High‑level view of how AegisAI connects your data sources, backend,
          and dashboards into a single AI immune system.
        </p>
      </div>

      <section className="glass-panel flex flex-col gap-5 px-4 py-4">
        <SectionHeader
          title="End‑to‑End Flow"
          subtitle="Data Sources → FastAPI Backend → AI Models → Frontend Dashboards"
        />

        <div className="relative grid gap-4 md:grid-cols-4">
          {blocks.map((block, idx) => (
            <div
              key={block.title}
              className="glass-panel-soft relative flex flex-col gap-2 px-3.5 py-3.5"
            >
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary-soft">
                  {block.icon}
                </div>
                <p className="text-sm font-semibold text-slate-100">
                  {idx + 1}. {block.title}
                </p>
              </div>
              <p className="text-[11px] text-slate-400">{block.description}</p>
              <ul className="mt-1 space-y-1 text-[11px] text-slate-300">
                {block.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <span className="mt-[5px] h-1 w-1 rounded-full bg-primary-soft" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 hidden -translate-y-1/2 items-center justify-between px-6 md:flex">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-80" />
          </div>
        </div>

        <div className="mt-2 grid gap-3 md:grid-cols-3 text-[11px] text-slate-400">
          <div className="rounded-2xl border border-slate-700/80 bg-slate-950/40 px-3.5 py-3">
            <p className="mb-1.5 text-xs font-semibold text-slate-100">
              Dockerized Microservices
            </p>
            <p>
              Each FastAPI component and model service can be deployed as an
              isolated container behind your preferred API gateway or service
              mesh.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/80 bg-slate-950/40 px-3.5 py-3">
            <p className="mb-1.5 text-xs font-semibold text-slate-100">
              Streaming & Batching
            </p>
            <p>
              AegisAI is designed to ingest both streaming events (identity,
              logs) and batched model telemetry, then normalize them into a
              unified timeline.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/80 bg-slate-950/40 px-3.5 py-3">
            <p className="mb-1.5 text-xs font-semibold text-slate-100">
              RBAC‑Aware Dashboards
            </p>
            <p>
              Admins see posture and configuration, security analysts see raw
              events and anomalies, and viewers see executive summaries—
              powered by the same backend signals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

