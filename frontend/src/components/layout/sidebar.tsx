'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Activity, Cloud, Map, Settings, ScrollText } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { RoleSwitcher } from "@/components/layout/role-switcher";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Activity },
  { href: "/model-security", label: "Model Security", icon: Shield },
  { href: "/cloud-monitoring", label: "Cloud Monitoring", icon: Cloud },
  { href: "/architecture", label: "Architecture", icon: Map },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 flex-col border-r border-border-subtle bg-gradient-to-b from-background to-surface/60 px-5 py-6 lg:flex">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="gradient-border rounded-2xl bg-surface p-[1px]">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 via-primary-soft/70 to-sky-400/80 shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium tracking-tight text-slate-100">
              AegisAI
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
              AI Immune System
            </span>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      <RoleSwitcher />

      <nav className="mt-6 flex flex-1 flex-col gap-1 text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-surface-muted/80 text-slate-50 shadow-sm ring-1 ring-primary/60"
                  : "text-slate-400 hover:bg-surface/70 hover:text-slate-100",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-xl border text-[13px] shadow-sm",
                  active
                    ? "border-primary/60 bg-primary/10 text-primary-soft"
                    : "border-slate-700/60 bg-surface/70 text-slate-400 group-hover:border-slate-500 group-hover:text-slate-100",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-slate-700/70 bg-gradient-to-br from-surface-muted/90 via-surface/95 to-surface-muted/80 px-3.5 py-3 text-xs text-slate-300 shadow-[0_20px_45px_rgba(15,23,42,0.85)]">
        <p className="mb-1.5 font-medium text-slate-100">System Status</p>
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-80" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="uppercase tracking-[0.18em] text-emerald-300">
              Live / Secure
            </span>
          </div>
          <span className="text-slate-400">Last sync: 3s ago</span>
        </div>
      </div>
    </aside>
  );
}

