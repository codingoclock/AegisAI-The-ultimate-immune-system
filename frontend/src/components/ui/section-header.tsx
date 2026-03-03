import { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  rightSlot?: ReactNode;
};

export function SectionHeader({
  title,
  subtitle,
  icon,
  rightSlot,
}: SectionHeaderProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {icon ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary-soft">
            {icon}
          </div>
        ) : null}
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-100">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {rightSlot ? <div className="text-xs text-slate-400">{rightSlot}</div> : null}
    </div>
  );
}

