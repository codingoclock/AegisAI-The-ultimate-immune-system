import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

const heroStats = [
  { label: "Model Robustness Increase", value: "42%", tone: "primary" },
  { label: "Anomalies Detected", value: "12.4k", tone: "amber" },
  { label: "System Uptime", value: "99.98%", tone: "green" },
  { label: "Critical Threats Blocked", value: "387", tone: "red" },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-background to-surface text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-[-140px] h-80 w-80 rounded-full bg-primary/25 blur-[80px]" />
        <div className="absolute right-[-120px] top-40 h-72 w-72 rounded-full bg-primary-soft/30 blur-[80px]" />
        <div className="absolute left-1/3 top-72 h-72 w-72 rounded-full bg-emerald-400/20 blur-[80px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="gradient-border rounded-2xl bg-surface p-[1px]">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-soft to-sky-400 shadow-lg">
              <span className="absolute h-9 w-9 animate-ping rounded-2xl bg-primary/35" />
              <Shield className="relative h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-slate-100">
              AegisAI
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
              AI Immune System
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 md:flex">
          <Link
            href="/dashboard"
            className="hover:text-slate-50 hover:underline hover:underline-offset-4"
          >
            Overview
          </Link>
          <Link
            href="/model-security"
            className="hover:text-slate-50 hover:underline hover:underline-offset-4"
          >
            Model Security
          </Link>
          <Link
            href="/cloud-monitoring"
            className="hover:text-slate-50 hover:underline hover:underline-offset-4"
          >
            Cloud & Identity
          </Link>
          <Link
            href="/architecture"
            className="hover:text-slate-50 hover:underline hover:underline-offset-4"
          >
            Architecture
          </Link>
        </nav>

        <Link
          href="/dashboard"
          className="pill hidden items-center gap-2 bg-surface/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground ring-1 ring-border-subtle backdrop-blur-lg transition hover:bg-surface hover:ring-primary/70 sm:flex"
        >
          Launch Console
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 pb-16 pt-10 text-center sm:px-6 lg:px-8 lg:pt-16">
        <section className="flex w-full max-w-3xl flex-col items-center gap-6">
          <span className="pill border border-primary/50 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-soft shadow-sm">
            Unified AI Defense for Models, Cloud, & Identity
          </span>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
            AegisAI – The{" "}
            <span className="bg-gradient-to-tr from-primary via-primary-soft to-sky-300 bg-clip-text text-transparent">
              AI Immune System
            </span>
          </h1>

          <p className="max-w-xl text-balance text-sm leading-relaxed text-slate-300 sm:text-base">
            AegisAI fuses hardened AI models, cloud identity analytics, and
            real‑time anomaly detection into a single security nervous system.
            See every attack path, from adversarial images to impossible travel,
            in one executive‑ready console.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/dashboard"
              className="pill inline-flex items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-foreground shadow-lg transition hover:bg-primary-soft"
            >
              Launch Live Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/architecture"
              className="pill inline-flex items-center justify-center gap-2 border border-border-subtle bg-surface/40 px-4 py-2.5 text-xs font-medium text-foreground backdrop-blur-md transition hover:border-primary/70 hover:text-primary-soft"
            >
              View Architecture Diagram
            </Link>
          </div>

          <div className="mt-6 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="glass-panel-soft relative overflow-hidden px-3.5 py-3 text-left"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-80" />
                <p className="min-h-[2.5rem] text-[11px] font-medium uppercase leading-tight tracking-[0.16em] text-slate-400">
                  {stat.label}
                </p>
                <p
                  className={[
                    "min-h-[1.75rem] text-xl font-semibold leading-none",
                    stat.tone === "primary" && "text-primary-soft",
                    stat.tone === "green" && "text-emerald-400",
                    stat.tone === "amber" && "text-amber-300",
                    stat.tone === "red" && "text-rose-400",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {stat.value}
                </p>
                <p className="mt-1 min-h-[2.5rem] text-[11px] leading-snug text-slate-400">
                  Live synthetic benchmark based on the last 30 days.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
