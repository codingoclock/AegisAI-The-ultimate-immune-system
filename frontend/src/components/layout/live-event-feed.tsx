type EventSeverity = "normal" | "suspicious" | "anomaly";

export type SecurityEvent = {
  id: string;
  type: string;
  actor: string;
  location: string;
  timeAgo: string;
  severity: EventSeverity;
  description: string;
};

const severityStyles: Record<
  EventSeverity,
  { label: string; chip: string; dot: string }
> = {
  normal: {
    label: "Normal",
    chip: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
    dot: "bg-emerald-400",
  },
  suspicious: {
    label: "Suspicious",
    chip: "bg-amber-500/10 text-amber-200 border-amber-500/40",
    dot: "bg-amber-300",
  },
  anomaly: {
    label: "Anomaly",
    chip: "bg-rose-500/10 text-rose-200 border-rose-500/40",
    dot: "bg-rose-400",
  },
};

type Props = {
  events: SecurityEvent[];
};

export function LiveEventFeed({ events }: Props) {
  return (
    <div className="glass-panel flex h-80 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle/70 px-4 py-3">
        <div>
          <p className="text-xs font-semibold tracking-tight text-slate-100">
            Live Event Feed
          </p>
          <p className="text-[11px] text-slate-400">
            Stream of recent identity and access activity.
          </p>
        </div>
        <span className="pill flex items-center gap-1.5 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/60">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live
        </span>
      </div>
      <div className="grid-no-scrollbar flex-1 space-y-1.5 overflow-y-auto px-3.5 py-3.5 text-xs">
        {events.map((event) => {
          const style = severityStyles[event.severity];
          return (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2.5"
            >
              <div className="mt-1 flex flex-col items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                <span className="h-full w-px bg-slate-700/70" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-100">
                      {event.type}
                    </span>
                    <span
                      className={`pill border px-2 py-0.5 text-[10px] font-medium ${style.chip}`}
                    >
                      {style.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {event.timeAgo}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  {event.description}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-slate-400">
                  <span className="pill bg-slate-800/80 px-2 py-0.5">
                    Actor: {event.actor}
                  </span>
                  <span className="pill bg-slate-800/80 px-2 py-0.5">
                    Location: {event.location}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

