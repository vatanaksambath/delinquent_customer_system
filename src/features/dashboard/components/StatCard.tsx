import { motion } from "motion/react";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  subValue?: string;
  variant?: "default" | "error" | "warning" | "success" | "wide";
  icon?: string;
}

export function StatCard({
  title,
  value,
  trend,
  subValue,
  variant = "default",
  icon,
}: StatCardProps) {
  // Resolve styling per variant
  const variantConfig = {
    default: {
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-foreground",
      accentBar: "from-primary/60 to-primary/20",
      defaultIcon: "analytics",
      badge: null,
    },
    error: {
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      valueColor: "text-red-500",
      accentBar: "from-red-500/60 to-red-500/10",
      defaultIcon: "priority_high",
      badge: "⚠",
    },
    warning: {
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      valueColor: "text-amber-500",
      accentBar: "from-amber-500/60 to-amber-500/10",
      defaultIcon: "warning",
      badge: null,
    },
    success: {
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
      valueColor: "text-green-600",
      accentBar: "from-green-500/60 to-green-500/10",
      defaultIcon: "check_circle",
      badge: null,
    },
    wide: {
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-foreground",
      accentBar: "from-primary/60 to-primary/20",
      defaultIcon: "speed",
      badge: null,
    },
  };

  const cfg = variantConfig[variant];
  const resolvedIcon = icon || cfg.defaultIcon;

  if (variant === "wide") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-card border border-border/60 rounded-2xl p-4 md:col-span-2 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden group cursor-default"
      >
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
        {/* Left accent bar */}
        <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-gradient-to-b ${cfg.accentBar}`} />

        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0 ml-2`}>
          <span className={`material-symbols-outlined text-[22px] ${cfg.iconColor}`}>
            {resolvedIcon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 z-10">
          <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-muted-foreground mb-1 truncate">
            {title}
          </p>
          <h3 className={`text-2xl font-headline font-bold tabular-nums leading-none tracking-tight ${cfg.valueColor}`}>
            {value}
          </h3>
          {subValue && (
            <p className="text-[10px] text-muted-foreground mt-1.5 font-medium truncate">
              {subValue}
            </p>
          )}
        </div>

        {/* Live badge */}
        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/15 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[8px] font-bold text-primary uppercase tracking-wider">Live</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden group cursor-default"
    >
      {/* Background accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${variant === "error" ? "from-red-500/[0.03]" : variant === "warning" ? "from-amber-500/[0.03]" : variant === "success" ? "from-green-500/[0.03]" : "from-primary/[0.02]"} to-transparent pointer-events-none`} />
      {/* Left accent bar */}
      <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-gradient-to-b ${cfg.accentBar}`} />

      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0 ml-2 group-hover:scale-105 transition-transform duration-300`}>
        <span className={`material-symbols-outlined text-[20px] ${cfg.iconColor}`}>
          {resolvedIcon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 z-10">
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-muted-foreground mb-1 truncate">
          {title}
        </p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className={`text-2xl font-headline font-bold tabular-nums leading-none tracking-tight ${cfg.valueColor}`}>
            {value}
          </h3>
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                trend.startsWith("-")
                  ? "bg-primary/10 text-primary"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              <span className="material-symbols-outlined text-[11px]">
                {trend.startsWith("-") ? "trending_down" : "trending_up"}
              </span>
              {trend}
            </span>
          )}
        </div>
        {subValue && (
          <p className="text-[10px] text-muted-foreground mt-1.5 font-medium truncate">
            {subValue}
          </p>
        )}
      </div>
    </motion.div>
  );
}
