'use client';

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background/90 to-surface-muted/70 text-foreground">
      <Sidebar />
      <main className="flex min-h-screen flex-1 flex-col bg-gradient-to-b from-background/70 via-background/60 to-surface/70">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}

