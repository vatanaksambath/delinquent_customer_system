import { motion } from "motion/react";

export function StatCard({
  title,
  value,
  trend,
  subValue,
  variant = "default",
}: {
  title: string;
  value: string;
  trend?: string;
  subValue?: string;
  variant?: "default" | "error" | "wide";
}) {
  if (variant === "wide") {
    return (
      <div className="modern-card p-3 md:col-span-2 flex flex-col justify-between h-24">
        <div className="flex justify-between items-start">
          <p className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">
            {title}
          </p>
          <div className="flex items-center gap-1 px-1 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="w-1 h-1 rounded-full bg-primary"></span>
            <span className="text-[7px] font-bold text-primary uppercase tracking-tighter">
              Live
            </span>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <h3 className="text-2xl font-headline font-bold text-foreground tabular-nums leading-none tracking-tight">
            {value}
          </h3>
          <div className="text-right">
            <p className="text-[7px] uppercase tracking-wider text-muted-foreground mb-0.5">
              Exposure
            </p>
            <p className="text-base font-headline font-bold text-error tabular-nums leading-none">
              {subValue}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "error") {
    return (
      <div className="modern-card p-3 flex flex-col justify-between h-24 border-error/20 bg-error/[0.02]">
        <div className="flex justify-between items-start">
          <p className="text-[8px] uppercase tracking-widest text-error font-bold">
            {title}
          </p>
          <span className="material-symbols-outlined text-error text-[16px]">
            priority_high
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-headline font-bold text-error tabular-nums leading-none tracking-tight">
            {value}
          </h3>
          <p className="text-[8px] text-error/60 mt-1 uppercase tracking-tight font-medium">
            {subValue}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-card p-3 flex flex-col justify-between h-24">
      <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">
        {title}
      </p>
      <div className="flex items-baseline gap-1.5 mt-1.5">
        <h3 className="text-2xl font-headline font-bold text-foreground tabular-nums leading-none tracking-tight">
          {value}
        </h3>
        {trend && (
          <span
            className={`text-[8px] font-bold flex items-center gap-0.5 ${trend.startsWith("-") ? "text-primary" : "text-error"}`}
          >
            <span className="material-symbols-outlined text-[10px]">
              {trend.startsWith("-") ? "trending_down" : "trending_up"}
            </span>
            {trend}
          </span>
        )}
      </div>
      <div className="w-full h-0.5 bg-muted  rounded-full mt-auto overflow-hidden">
        <div className="h-full bg-primary" style={{ width: "64%" }}></div>
      </div>
    </div>
  );
}
