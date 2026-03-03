import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "green" | "amber" | "red" | "primary";
  icon?: ReactNode;
};

const toneClasses: Record<
  NonNullable<StatCardProps["tone"]>,
  { value: string; chip: string }
> = {
  default: {
    value: "text-slate-50",
    chip: "bg-slate-800/60 text-slate-300",
  },
  primary: {
    value: "text-primary-soft",
    chip: "bg-primary/15 text-primary-soft",
  },
  green: {
    value: "text-emerald-400",
    chip: "bg-emerald-500/15 text-emerald-300",
  },
  amber: {
    value: "text-amber-300",
    chip: "bg-amber-500/15 text-amber-200",
  },
  red: {
    value: "text-rose-300",
    chip: "bg-rose-500/15 text-rose-200",
  },
};

export function StatCard({
  label,
  value,
  helper,
  tone = "default",
  icon,
}: StatCardProps) {
  const toneClass = toneClasses[tone];

  return (
    <div className="glass-panel-soft relative overflow-hidden px-4 py-3.5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-80" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className={`mt-2 text-xl font-semibold ${toneClass.value}`}>
            {value}
          </p>
          {helper ? (
            <p className="mt-1 text-[11px] text-slate-400">{helper}</p>
          ) : null}
        </div>
        {icon ? (
          <div
            className={`pill flex h-8 w-8 items-center justify-center text-xs font-medium ${toneClass.chip}`}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

