"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  User,
  Zap,
  ChevronRight,
  RefreshCw,
  Filter,
  TrendingUp,
  Flame,
  Star,
  Info,
  ClipboardList,
  HelpCircle,
} from "lucide-react";
import { SAMPLE_DATA, LedgerEntry } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
type Priority = "Critical" | "High" | "Medium";
type QueueReason =
  | "Broken PTP"
  | "High-Risk Early DPD"
  | "Follow-Up Due"
  | "Escalated"
  | "New Assignment";

interface QueueItem {
  id: string;
  loanId: string;
  customerName: string;
  phone: string;
  outstanding: number;
  dpd: number;
  reason: QueueReason;
  priority: Priority;
  assignedAt: string;
  lastContactDate?: string;
  entry: LedgerEntry; // keep the full entry to pass to collection form
}

// ─── Derived mock queue from SAMPLE_DATA ─────────────────────────────────────
const REASONS: QueueReason[] = [
  "Broken PTP",
  "High-Risk Early DPD",
  "Follow-Up Due",
  "Escalated",
  "New Assignment",
];

const mockQueue: QueueItem[] = SAMPLE_DATA.slice(0, 18).map(
  (entry: LedgerEntry, i) => {
    const dpd = entry.past_due ?? 0;
    const outstanding = entry.ovrdue_pr ?? entry.usd_equivalent ?? 0;
    const priority: Priority =
      dpd >= 60 ? "Critical" : dpd >= 30 ? "High" : "Medium";
    const reason = REASONS[i % REASONS.length];
    return {
      id: `Q-${1000 + i}`,
      loanId: entry.account_number,
      customerName: entry.customer_name,
      phone: entry.phone_number ?? "+1 (555) " + (100 + i).toString().padStart(3, "0") + "-" + (1000 + i).toString().padStart(4, "0"),
      outstanding,
      dpd,
      reason,
      priority,
      assignedAt: "Today, 07:00 AM",
      lastContactDate: entry.last_call_visit_date ?? undefined,
      entry,
    };
  }
);

// ─── Priority Config ──────────────────────────────────────────────────────────
const priorityConfig: Record<Priority, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  Critical: {
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30",
    icon: <Flame className="w-3.5 h-3.5" />,
    label: "Critical",
  },
  High: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    label: "High",
  },
  Medium: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30",
    icon: <Star className="w-3.5 h-3.5" />,
    label: "Medium",
  },
};

const reasonConfig: Record<QueueReason, { icon: React.ReactNode; color: string; description: string }> = {
  "Broken PTP": {
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: "text-rose-500",
    description: "Customer missed a Promise-to-Pay that was due. Needs immediate follow-up.",
  },
  "High-Risk Early DPD": {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: "text-amber-500",
    description: "Account flagged as early-stage delinquent with high-risk profile. Act before DPD worsens.",
  },
  "Follow-Up Due": {
    icon: <Clock className="w-3.5 h-3.5" />,
    color: "text-blue-500",
    description: "A scheduled follow-up contact is due today based on previous interaction logs.",
  },
  Escalated: {
    icon: <Zap className="w-3.5 h-3.5" />,
    color: "text-purple-500",
    description: "Case has been escalated by a supervisor or system rule. Requires priority handling.",
  },
  "New Assignment": {
    icon: <User className="w-3.5 h-3.5" />,
    color: "text-emerald-500",
    description: "Newly assigned account from portfolio redistribution or new delinquency detection.",
  },
};

// ─── Props ─────────────────────────────────────────────────────────────────────
interface WorklistScreenProps {
  onStartCollection?: (entry: LedgerEntry) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorklistScreen({ onStartCollection }: WorklistScreenProps) {
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [reasonFilter, setReasonFilter] = useState<QueueReason | "All">("All");
  const [handledIds, setHandledIds] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const filtered = useMemo(() => {
    return mockQueue.filter((item) => {
      const matchPriority = priorityFilter === "All" || item.priority === priorityFilter;
      const matchReason = reasonFilter === "All" || item.reason === reasonFilter;
      const notHandled = !handledIds.has(item.id);
      return matchPriority && matchReason && notHandled;
    });
  }, [priorityFilter, reasonFilter, handledIds]);

  const stats = useMemo(() => ({
    total: mockQueue.length,
    critical: mockQueue.filter((i) => i.priority === "Critical").length,
    completed: handledIds.size,
    remaining: mockQueue.length - handledIds.size,
  }), [handledIds]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const markHandled = (id: string) => {
    setHandledIds((prev) => new Set([...prev, id]));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleStartCollection = (e: React.MouseEvent, item: QueueItem) => {
    e.stopPropagation();
    if (onStartCollection) {
      onStartCollection(item.entry);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-background overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="px-8 pt-8 pb-5 shrink-0 bg-card border-b border-border">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Live Queue
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              My Daily Worklist
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Auto-assigned cases for today. Work through them top to bottom — Critical first.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Legend Toggle */}
            <button
              onClick={() => setShowLegend(!showLegend)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                showLegend
                  ? "bg-blue-50 dark:bg-blue-500/10 border-blue-400 text-blue-600 dark:text-blue-400"
                  : "border-border bg-muted text-muted-foreground hover:text-foreground hover:border-blue-500/50"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Legend
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground hover:border-blue-500/50 text-xs font-bold uppercase tracking-wider transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Queue
            </button>
          </div>
        </div>

        {/* ── Legend Panel ── */}
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-5 bg-muted/60 border border-border rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Queue Reasons</div>
                  {(Object.entries(reasonConfig) as [QueueReason, typeof reasonConfig[QueueReason]][]).map(([reason, cfg]) => (
                    <div key={reason} className="flex items-start gap-2 mb-2">
                      <span className={`mt-0.5 shrink-0 ${cfg.color}`}>{cfg.icon}</span>
                      <div>
                        <span className={`text-xs font-bold ${cfg.color}`}>{reason}</span>
                        <p className="text-[11px] text-muted-foreground leading-snug">{cfg.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Priority Levels</div>
                  {(Object.entries(priorityConfig) as [Priority, typeof priorityConfig[Priority]][]).map(([p, cfg]) => (
                    <div key={p} className={`flex items-center gap-2 mb-2 px-3 py-2 rounded-lg border ${cfg.bg}`}>
                      <span className={cfg.color}>{cfg.icon}</span>
                      <div>
                        <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                        <p className="text-[11px] text-muted-foreground">
                          {p === "Critical" ? "DPD ≥ 60 — Immediate action required" : p === "High" ? "DPD 30–59 — Urgent contact today" : "DPD < 30 — Standard follow-up"}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-3 text-[11px] text-blue-700 dark:text-blue-400">
                    <strong>DPD</strong> = Days Past Due. <strong>Overdue Principal</strong> = amount of principal currently overdue.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            { label: "Total Assigned", value: stats.total, color: "text-foreground" },
            { label: "Critical", value: stats.critical, color: "text-rose-600 dark:text-rose-400" },
            { label: "Handled", value: stats.completed, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Remaining", value: stats.remaining, color: "text-blue-600 dark:text-blue-400" },
          ].map((s) => (
            <div key={s.label} className="bg-muted/50 border border-border rounded-xl px-4 py-3">
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Progress Bar ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% Handled
          </span>
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-3 mt-4">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex gap-2 flex-wrap">
            {(["All", "Critical", "High", "Medium"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  priorityFilter === p
                    ? p === "All"
                      ? "bg-foreground text-background border-foreground"
                      : `${priorityConfig[p as Priority]?.bg} ${priorityConfig[p as Priority]?.color} border-current`
                    : "border-border text-muted-foreground hover:border-blue-500/50 hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
            <div className="w-px bg-border mx-1" />
            {(["All", "Broken PTP", "High-Risk Early DPD", "Follow-Up Due", "Escalated", "New Assignment"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setReasonFilter(r)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  reasonFilter === r
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-blue-500/50 hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="text-lg font-bold text-foreground">Queue is clear!</p>
              <p className="text-muted-foreground text-sm">All filtered cases are handled for today.</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const pCfg = priorityConfig[item.priority];
              const rCfg = reasonConfig[item.reason];
              const isSelected = selectedItem?.id === item.id;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => setSelectedItem(isSelected ? null : item)}
                  className={`bg-card border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "border-blue-500/60 shadow-md ring-1 ring-blue-500/20" : "border-border hover:border-blue-500/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Priority indicator */}
                    <div className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center border ${pCfg.bg} ${pCfg.color}`}>
                      {pCfg.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm text-foreground">{item.customerName}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{item.loanId}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${pCfg.bg} ${pCfg.color}`}>
                          {pCfg.icon}
                          {pCfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${rCfg.color}`}>
                          {rCfg.icon}
                          {item.reason}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          <span className="font-bold">DPD</span> {item.dpd} days
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Overdue: ${item.outstanding.toLocaleString()}
                        </span>
                        {item.lastContactDate && (
                          <span className="text-[10px] text-muted-foreground">
                            Last contact: {item.lastContactDate}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions (Quick Buttons) */}
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleStartCollection(e, item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                        title="Open the collection input form for this account"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        Start Collection
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); markHandled(item.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-card hover:bg-muted border border-border text-foreground hover:text-foreground rounded-lg text-xs font-bold transition-all shadow-sm"
                        title="Mark this case as handled without opening the collection form"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Mark Handled
                      </button>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
                          <div className="bg-muted/30 border border-border rounded-xl p-3">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Customer Phone</div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              <Phone className="w-4 h-4 text-blue-500" />
                              {item.phone}
                            </div>
                          </div>
                          <div className="bg-muted/30 border border-border rounded-xl p-3">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Assigned At</div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {item.assignedAt}
                            </div>
                          </div>
                          <div className="col-span-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-3 flex items-start gap-3">
                            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-sm font-medium text-amber-800 dark:text-amber-300">
                              <strong className="text-amber-900 dark:text-amber-200">Why in queue:</strong> {rCfg.description}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
