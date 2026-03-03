'use client';

import { useState } from "react";

type Role = "Admin" | "Security Analyst" | "Viewer";

const roles: Role[] = ["Admin", "Security Analyst", "Viewer"];

export function RoleSwitcher() {
  const [activeRole, setActiveRole] = useState<Role>("Security Analyst");

  return (
    <div className="glass-panel-soft mt-1 px-3.5 py-3 text-xs text-slate-300">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium text-slate-100">Active Persona</p>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-soft">
          RBAC Mock
        </span>
      </div>
      <div className="flex gap-1.5">
        {roles.map((role) => {
          const isActive = role === activeRole;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setActiveRole(role)}
              className={[
                "pill flex-1 px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                isActive
                  ? "bg-primary/80 text-slate-50 shadow-sm"
                  : "bg-surface/80 text-slate-300 hover:bg-surface-muted/90",
              ].join(" ")}
            >
              {role}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        This controls what we emphasize on each dashboard (Admin: posture, Analyst: anomalies, Viewer: summaries).
      </p>
    </div>
  );
}

