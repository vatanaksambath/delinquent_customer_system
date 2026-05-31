import React from "react";
import { motion } from "motion/react";

export default function PerformanceKPIsScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-background overflow-y-auto px-8 py-6 gap-6"
    >
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight mb-2">
          Performance KPIs & Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Real-time collections efficiency and risk management metrics.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* PAR 30 */}
        <div className="modern-card p-6 border border-border bg-card  shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 flex justify-between">
            Portfolio at Risk 30+
            <span className="material-symbols-outlined text-xs text-error">
              trending_down
            </span>
          </p>
          <h3 className="text-3xl font-headline font-bold text-foreground tabular-nums mb-4">
            $1.4M
          </h3>
          <div className="w-full bg-muted  rounded-full h-2">
            <div
              className="bg-error h-2 rounded-full"
              style={{ width: "45%" }}
            ></div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-right">
            45% of Total Book
          </p>
        </div>

        {/* PAR 90 */}
        <div className="modern-card p-6 border border-border bg-card  shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-error shadow-[0_0_10px_red]"></div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 flex justify-between">
            Portfolio at Risk 90+
            <span className="material-symbols-outlined text-xs text-error">
              trending_up
            </span>
          </p>
          <h3 className="text-3xl font-headline font-bold text-foreground tabular-nums mb-4">
            $890K
          </h3>
          <div className="w-full bg-muted  rounded-full h-2">
            <div
              className="bg-error h-2 rounded-full"
              style={{ width: "18%" }}
            ></div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-right">
            18% of Total Book
          </p>
        </div>

        {/* CEI */}
        <div className="modern-card p-6 border border-border bg-card  shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-success"></div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 flex justify-between">
            Collection Effectiveness (CEI)
            <span className="material-symbols-outlined text-xs text-success">
              trending_up
            </span>
          </p>
          <h3 className="text-3xl font-headline font-bold text-foreground tabular-nums mb-4">
            88.4%
          </h3>
          <div className="w-full bg-muted  rounded-full h-2">
            <div
              className="bg-success h-2 rounded-full"
              style={{ width: "88.4%" }}
            ></div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-right">
            Target: &gt;85%
          </p>
        </div>

        {/* PTP Success */}
        <div className="modern-card p-6 border border-border bg-card  shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 flex justify-between">
            PTP Settlement Success
            <span className="material-symbols-outlined text-xs text-primary">
              trending_flat
            </span>
          </p>
          <h3 className="text-3xl font-headline font-bold text-foreground tabular-nums mb-4">
            68.5%
          </h3>
          <div className="w-full bg-muted  rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: "68.5%" }}
            ></div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-right">
            Target: &gt;75%
          </p>
        </div>
      </div>

      {/* Trend Visualizer */}
      <div className="modern-card border border-border bg-card  shadow-sm p-6 mt-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-6">
          Recovery Yields vs Charge-off Trend (YTD)
        </h3>

        <div className="h-64 flex items-end gap-2 sm:gap-4 md:gap-8 justify-between pt-10">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, i) => {
            const recoveryHeight = [60, 65, 55, 70, 80, 75][i];
            const chargeOffHeight = [20, 25, 30, 20, 15, 10][i];
            return (
              <div
                key={month}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                <div className="w-full flex justify-center items-end h-full gap-1">
                  <div
                    className="w-1/3 bg-success/80 rounded-t-sm group-hover:bg-success transition-colors"
                    style={{ height: `${recoveryHeight}%` }}
                    title={`Recovery: ${recoveryHeight}%`}
                  ></div>
                  <div
                    className="w-1/3 bg-error/80 rounded-t-sm group-hover:bg-error transition-colors"
                    style={{ height: `${chargeOffHeight}%` }}
                    title={`Charge-off: ${chargeOffHeight}%`}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {month}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-8 mt-6 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-success/80"></div>
            <span className="text-xs font-medium text-muted-foreground">
              Recovery Yield
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-error/80"></div>
            <span className="text-xs font-medium text-muted-foreground">
              Charge-off Rate
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
