import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Area,
} from "recharts";

// --- Types ---
interface FilterOption {
  id: string;
  label: string;
}

interface DataState {
  trend: { name: string; balance: number; acc: number }[];
  collection: { name: string; par: number; npl: number; total: number }[];
  metrics: {
    outstanding: { value: string; detail: string };
    par: { value: string; detail: string };
    npl: { value: string; detail: string };
  };
}

// --- Dummy Data Presets ---
const DATA_PRESETS: Record<string, DataState> = {
  all: {
    trend: [
      { name: "Jan", balance: 49534, acc: 3100 },
      { name: "Feb", balance: 52755, acc: 4800 },
      { name: "Mar", balance: 48900, acc: 4200 },
      { name: "Apr", balance: 51851, acc: 5300 },
      { name: "May", balance: 47840, acc: 4500 },
      { name: "Jun", balance: 51967, acc: 5800 },
    ],
    collection: [
      { name: "Dec", par: 40000, npl: 50000, total: 90000 },
      { name: "Jan", par: 35000, npl: 40000, total: 75000 },
      { name: "Feb", par: 32000, npl: 45000, total: 77000 },
      { name: "Mar", par: 30000, npl: 50000, total: 80000 },
      { name: "Apr", par: 15000, npl: 15000, total: 30000 },
      { name: "May", par: 50000, npl: 30000, total: 80000 },
    ],
    metrics: {
      outstanding: { value: "$700M", detail: "13,000 Accounts | 12,000 CIDs" },
      par: { value: "10.8%", detail: "$1.5M Outstanding | 1,600 Acc" },
      npl: { value: "6.24%", detail: "$1.0M Outstanding | 600 Acc" },
    },
  },
  north: {
    trend: [
      { name: "Jan", balance: 21000, acc: 1200 },
      { name: "Feb", balance: 24000, acc: 1800 },
      { name: "Mar", balance: 21500, acc: 1600 },
      { name: "Apr", balance: 25000, acc: 2100 },
      { name: "May", balance: 22800, acc: 1900 },
      { name: "Jun", balance: 26000, acc: 2400 },
    ],
    collection: [
      { name: "Dec", par: 12000, npl: 15000, total: 27000 },
      { name: "Jan", par: 11000, npl: 14000, total: 25000 },
      { name: "Feb", par: 10500, npl: 16000, total: 26500 },
      { name: "Mar", par: 9000, npl: 18000, total: 27000 },
      { name: "Apr", par: 5000, npl: 5000, total: 10000 },
      { name: "May", par: 15000, npl: 10000, total: 25000 },
    ],
    metrics: {
      outstanding: { value: "$210M", detail: "4,200 Accounts | 3,800 CIDs" },
      par: { value: "8.4%", detail: "$0.4M Outstanding | 420 Acc" },
      npl: { value: "4.1%", detail: "$0.2M Outstanding | 150 Acc" },
    },
  },
  south: {
    trend: [
      { name: "Jan", balance: 28000, acc: 2200 },
      { name: "Feb", balance: 31000, acc: 2800 },
      { name: "Mar", balance: 29000, acc: 2400 },
      { name: "Apr", balance: 33000, acc: 3100 },
      { name: "May", balance: 30800, acc: 2700 },
      { name: "Jun", balance: 35000, acc: 3400 },
    ],
    collection: [
      { name: "Dec", par: 18000, npl: 20000, total: 38000 },
      { name: "Jan", par: 17000, npl: 19000, total: 36000 },
      { name: "Feb", par: 16500, npl: 21000, total: 37500 },
      { name: "Mar", par: 15000, npl: 23000, total: 38000 },
      { name: "Apr", par: 10000, npl: 10000, total: 20000 },
      { name: "May", par: 20000, npl: 15000, total: 35000 },
    ],
    metrics: {
      outstanding: { value: "$320M", detail: "6,200 Accounts | 5,800 CIDs" },
      par: { value: "11.2%", detail: "$0.6M Outstanding | 520 Acc" },
      npl: { value: "6.8%", detail: "$0.3M Outstanding | 250 Acc" },
    },
  },
};

const REGIONS: FilterOption[] = [
  { id: "all", label: "All Regions" },
  { id: "north", label: "North Region" },
  { id: "south", label: "South Region" },
  { id: "east", label: "East Region" },
  { id: "west", label: "West Region" },
];

// --- Sub-components ---

const Toast = React.memo(
  ({ message, onClose }: { message: string; onClose: () => void }) => {
    React.useEffect(() => {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }, [onClose]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 glass-panel rounded-full bg-on-surface text-surface z-[100] flex items-center gap-3 shadow-2xl border-primary/20"
      >
        <span className="material-symbols-outlined text-primary text-xl">
          info
        </span>
        <span className="text-xs font-bold uppercase tracking-wider">
          {message}
        </span>
      </motion.div>
    );
  },
);

const ModernDropdown = React.memo(
  ({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (id: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLabel =
      options.find((o) => o.id === value)?.label || "Select...";

    return (
      <div className={`flex flex-col flex-1 min-w-[140px] relative ${isOpen ? "z-50" : "z-10"}`}>
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">
          {label}
        </label>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="glass-panel h-10 px-3 flex items-center justify-between cursor-pointer rounded-lg bg-card "
        >
          <span className={`text-[11px] font-bold truncate ${value ? "text-slate-500" : "text-foreground font-medium"}`}>
            {selectedLabel}
          </span>
          <span
            className={`material-symbols-outlined text-[18px] text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          >
            expand_more
          </span>
        </div>

        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-[100%] left-0 w-full mt-1 glass-panel rounded-lg shadow-2xl overflow-hidden z-[70] border-border  py-1 bg-card  transition-colors"
              >
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2 text-[11px] cursor-pointer transition-colors flex items-center justify-between ${value === opt.id ? "bg-primary/10 text-primary font-bold" : "hover:bg-primary/5 text-foreground"}`}
                  >
                    <span>{opt.label}</span>
                    {value === opt.id && (
                      <div className="w-2 h-2 rounded-full bg-slate-500 shadow-[0_0_6px_rgba(100,116,139,0.4)] ml-2"></div>
                    )}
                  </div>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

const MetricCard = React.memo(
  ({
    title,
    value,
    subText,
    icon,
    colorClass,
    onClick,
  }: {
    title: string;
    value: string;
    subText: string;
    icon: string;
    colorClass: string;
    onClick: () => void;
  }) => {
    const iconColorMap: Record<string, string> = {
      "bg-primary": "text-primary",
      "bg-accent": "text-amber-500",
      "bg-error": "text-red-500",
    };
    const iconBgMap: Record<string, string> = {
      "bg-primary": "bg-primary/10",
      "bg-accent": "bg-amber-500/10",
      "bg-error": "bg-red-500/10",
    };
    const accentBarMap: Record<string, string> = {
      "bg-primary": "bg-primary",
      "bg-accent": "bg-amber-500",
      "bg-error": "bg-red-500",
    };
    const iconColor = iconColorMap[colorClass] ?? "text-primary";
    const iconBg = iconBgMap[colorClass] ?? "bg-primary/10";
    const accentBar = accentBarMap[colorClass] ?? "bg-primary";

    return (
      <motion.div
        onClick={onClick}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="relative bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-5 cursor-pointer shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden group"
      >
        {/* Soft gradient tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
        {/* Left accent bar */}
        <div className={`absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full ${accentBar}`} />

        {/* Icon box */}
        <div className={`relative w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm shrink-0 ml-1 group-hover:scale-110 transition-transform duration-300`}>
          <span className={`material-symbols-outlined text-[28px] ${iconColor}`}>
            {icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col min-w-0 z-10">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.22em]">
              {title}
            </p>
            <span className="material-symbols-outlined text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              open_in_new
            </span>
          </div>
          <h3 className="text-3xl font-headline font-bold text-foreground tabular-nums leading-none tracking-tight">
            {value}
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium mt-2 truncate">
            {subText}
          </p>
        </div>
      </motion.div>
    );
  },
);

const ModernSummaryTable = React.memo(
  ({ title, headers, rows, totalRow, onRowClick }: any) => (
    <div className="modern-card p-0 shadow-xl border-border flex flex-col h-full bg-card  overflow-hidden">
      {/* Digital Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-muted border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 bg-primary/20 rounded-full"></div>
          <h4 className="text-[11px] font-bold uppercase tracking-tighter text-foreground">
            {title}
          </h4>
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary/10"></div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden [scrollbar-gutter:stable] relative flex flex-col pt-3 px-6 pb-2">
        {/* Column Headers */}
        <div className="grid grid-cols-4 gap-4 mb-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border  pb-1 shrink-0">
          {headers.map((h: string, i: number) => (
            <div key={i} className={i === 0 ? "text-left" : "text-right"}>
              {h}
            </div>
          ))}
        </div>

        {/* Structured Rows */}
        <div className="flex flex-col gap-1 pb-2 grow">
          {rows.map((row: any[], i: number) => (
            <div
              key={i}
              onClick={() => onRowClick(row)}
              className="grid grid-cols-4 gap-4 py-2 px-2 rounded-lg bg-card  hover:bg-primary/5 border border-transparent hover:border-primary/20 cursor-pointer group items-center"
            >
              <div className="text-[11px] font-bold text-foreground truncate group-hover:text-primary">
                {row[0]}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground text-right tabular-nums">
                {row[1]}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground text-right tabular-nums">
                {row[2]}
              </div>
              <div className="text-[10px] font-bold text-primary text-right tabular-nums">
                {row[3]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Aggregate - Outside scroll area for full-width background */}
      {totalRow && (
        <div className="bg-muted border-t border-border px-6 py-4 shrink-0 pr-[calc(1.5rem+16px)]">
          <div className="grid grid-cols-4 gap-4 w-full">
            <div className="text-[11px] font-black text-foreground uppercase tracking-widest">
              {totalRow[0]}
            </div>
            <div className="text-[10px] font-black text-foreground text-right tabular-nums">
              {totalRow[1]}
            </div>
            <div className="text-[10px] font-black text-foreground text-right tabular-nums">
              {totalRow[2]}
            </div>
            <div className="text-[10px] font-black text-primary text-right tabular-nums">
              {totalRow[3]}
            </div>
          </div>
        </div>
      )}
    </div>
  ),
);

const ChartLegend = React.memo(
  ({
    items,
  }: {
    items: { label: string; color: string; isLine?: boolean }[];
  }) => (
    <div className="flex flex-wrap items-center justify-center gap-8 mt-4 pt-4 border-t border-border ">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          {item.isLine ? (
            <div className="relative flex items-center justify-center w-10 h-3">
              <div
                className="w-full h-[3px] rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <div
                className="absolute w-3 h-3 rounded-full border-2 border-surface shadow-sm"
                style={{ backgroundColor: item.color }}
              ></div>
            </div>
          ) : (
            <div
              className="w-6 h-3 rounded-sm shadow-sm"
              style={{ backgroundColor: item.color }}
            ></div>
          )}
          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  ),
);

export default function DashboardScreen() {
  const [region, setRegion] = useState("all");
  const [branch, setBranch] = useState("all");
  const [toast, setToast] = useState<string | null>(null);

  // Derive data based on region (fallback to 'all' if preset not defined)
  const currentData = DATA_PRESETS[region] || DATA_PRESETS.all;

  const handlePrint = () => {
    setToast("Preparing report for printing...");
    window.focus();
    setTimeout(() => {
      window.print();
    }, 20);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-background overflow-y-auto px-8 py-6 gap-8 pb-32 scroll-smooth dashboard-container"
    >
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* 1. Header & Filters */}
      <div className="flex flex-col gap-6 relative z-[100]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="digital-badge bg-primary/10 text-primary">
                Portfolio Live Analytics
              </span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-tighter group hover:text-primary transition-colors cursor-pointer">
                v2.4.0-STABLE
              </span>
            </div>
            <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">
              Monitor Delinquent Customer System (MDCS)
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-1 shadow-sm transition-all hover:shadow-md">
              <button
                onClick={() => setToast("Generating monthly report...")}
                className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-foreground/80 hover:text-foreground hover:bg-primary/10 rounded-xl transition-all duration-300"
              >
                <span className="material-symbols-outlined text-[18px] text-primary/80">
                  calendar_month
                </span>
                APRIL 2026
              </button>
              <div className="w-[1px] h-5 bg-border/60 mx-1"></div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-foreground/80 hover:text-foreground hover:bg-primary/10 rounded-xl transition-all duration-300 no-print group"
              >
                <span className="material-symbols-outlined text-[18px] text-primary/80 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-300">
                  print
                </span>
                PRINT REPORT
              </button>
            </div>
            
            <button
              onClick={() => {
                setToast("Refreshing dashboard data...");
                setRegion("all");
              }}
              className="relative overflow-hidden group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground rounded-2xl font-bold text-[12px] shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out rounded-2xl"></div>
              <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-500 relative z-10">
                sync
              </span>
              <span className="relative z-10 tracking-wide">REFRESH DATA</span>
            </button>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-end gap-4 shadow-sm border-border relative z-10 bg-card">
          <ModernDropdown
            label="Region"
            options={REGIONS}
            value={region}
            onChange={setRegion}
          />
          <ModernDropdown
            label="Branch"
            options={[
              { id: "all", label: "All Branches" },
              { id: "b1", label: "Downtown" },
              { id: "b2", label: "Eastside" },
            ]}
            value={branch}
            onChange={setBranch}
          />
          <ModernDropdown
            label="Product Group"
            options={[
              { id: "all", label: "All Products" },
              { id: "retail", label: "Retail Banking" },
              { id: "sme", label: "SME Loans" },
            ]}
            value="all"
            onChange={() => {}}
          />
          <ModernDropdown
            label="LRO Name"
            options={[
              { id: "all", label: "All LROs" },
              { id: "jdoe", label: "John Doe" },
            ]}
            value="all"
            onChange={() => {}}
          />

          <button
            onClick={() =>
              setToast(
                `Generating preview for ${region === "all" ? "Entire Portfolio" : REGIONS.find((r) => r.id === region)?.label}...`,
              )
            }
            className="h-10 px-8 bg-foreground text-background text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary hover:text-primary-foreground shadow-sm transition-all duration-200 cursor-pointer"
          >
            Preview Report
          </button>
        </div>
      </div>

      {/* 2. Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="OS"
          value={currentData.metrics.outstanding.value}
          subText={currentData.metrics.outstanding.detail}
          icon="account_balance"
          colorClass="bg-primary"
          onClick={() => setToast("Opening Outstanding Balance Details...")}
        />
        <MetricCard
          title="PAR30+ Status"
          value={currentData.metrics.par.value}
          subText={currentData.metrics.par.detail}
          icon="warning"
          colorClass="bg-accent"
          onClick={() => setToast("Analyzing PAR30+ Delinquency...")}
        />
        <MetricCard
          title="Non-Performing (NPL)"
          value={currentData.metrics.npl.value}
          subText={currentData.metrics.npl.detail}
          icon="error"
          colorClass="bg-error"
          onClick={() => setToast("Investigating NPL Classifications...")}
        />
      </div>

      {/* 3. Advanced Visualization Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-[0.3em] opacity-80">
            Temporal Performance (T-6 Months)
          </h2>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 cursor-pointer group"
              onClick={() => setToast("Focusing on Balance trends")}
            >
              <div className="w-2.5 h-2.5 rounded-sm bg-primary border border-primary"></div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter group-hover:text-primary">
                Balance
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 cursor-pointer group"
              onClick={() => setToast("Focusing on Growth trend")}
            >
              <div className="w-3 h-0.5 bg-accent"></div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter group-hover:text-accent">
                Growth
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Chart 1 */}
          <div
            onClick={() => setToast("Interacting with PAR30+ Trend Chart...")}
            className="modern-card p-4 h-[380px] flex flex-col font-headline group cursor-crosshair overflow-hidden"
          >
            <div className="flex flex-col items-center mb-4">
              <h3 className="text-[14px] font-bold text-primary underline underline-offset-4 decoration-primary/30">
                Trend of PAR30+ & Loan Account
              </h3>
            </div>

            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%" debounce={200}>
                <ComposedChart
                  data={currentData.trend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-outline)"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--color-secondary)" }}
                  />
                  <YAxis
                    yAxisId="left"
                    fontSize={9}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--color-secondary)" }}
                  />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip
                    cursor={{ fill: "var(--color-primary)", opacity: 0.05 }}
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-outline)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="balance"
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="acc"
                    stroke="#2E7D32"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#2E7D32",
                      strokeWidth: 2,
                      stroke: "white",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#2E7D32",
                      stroke: "white",
                      strokeWidth: 2,
                    }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <ChartLegend
              items={[
                { label: "OS", color: "var(--color-primary)" },
                { label: "Total Loan Acc", color: "#2E7D32", isLine: true },
              ]}
            />
          </div>

          {/* Chart 2 */}
          <div
            onClick={() => setToast("Interacting with NPL Vector Analysis...")}
            className="modern-card p-4 h-[380px] flex flex-col font-headline group cursor-crosshair overflow-hidden"
          >
            <div className="flex flex-col items-center mb-4">
              <h3 className="text-[14px] font-bold text-error underline underline-offset-4 decoration-error/30">
                Trend of NPL+ & Loan Account
              </h3>
            </div>

            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%" debounce={200}>
                <ComposedChart
                  data={currentData.trend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-error)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-error)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-outline)"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    fontSize={9}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip
                    cursor={{ stroke: "var(--color-error)", strokeWidth: 1 }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="balance"
                    fill="url(#areaGradient)"
                    stroke="var(--color-error)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="acc"
                    fill="#FF8F00"
                    opacity={0.7}
                    barSize={24}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="acc"
                    stroke="#2E7D32"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#2E7D32",
                      strokeWidth: 2,
                      stroke: "white",
                    }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <ChartLegend
              items={[
                { label: "OS", color: "#FF8F00" },
                { label: "Total Loan Acc", color: "#2E7D32", isLine: true },
              ]}
            />
          </div>

          {/* Chart 3 */}
          <div
            onClick={() => setToast("Reviewing Recovery Distribution...")}
            className="modern-card p-4 h-[380px] flex flex-col font-headline group cursor-crosshair overflow-hidden"
          >
            <div className="flex flex-col items-center mb-4 text-center">
              <h3 className="text-[12px] font-bold text-foreground">
                Loan Collection PAR30+ and NPL by Amt (in the last 6 months)
              </h3>
            </div>

            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%" debounce={200}>
                <LineChart
                  data={currentData.collection}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-outline)"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis fontSize={9} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line
                    dataKey="par"
                    name="PAR 30+"
                    stroke="#1565C0"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#1565C0",
                      strokeWidth: 2,
                      stroke: "white",
                    }}
                    isAnimationActive={false}
                  />
                  <Line
                    dataKey="npl"
                    name="NPL"
                    stroke="#EF6C00"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#EF6C00",
                      strokeWidth: 2,
                      stroke: "white",
                    }}
                    isAnimationActive={false}
                  />
                  <Line
                    dataKey="total"
                    name="Total Rec"
                    stroke="#757575"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#757575",
                      strokeWidth: 2,
                      stroke: "white",
                    }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <ChartLegend
              items={[
                { label: "PAR30+", color: "#1565C0", isLine: true },
                { label: "NPL", color: "#EF6C00", isLine: true },
                { label: "TOTAL", color: "#757575", isLine: true },
              ]}
            />
          </div>
        </div>
      </div>

      {/* 4. Strategic Summary Section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-[0.3em] px-1 opacity-80">
          Deep-Dive Portfolio Segmentation
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <ModernSummaryTable
              title="REASON OF LOAN DEFAULT"
              headers={[
                "ROUT COURSE OF LOAN DEFAULT",
                "#CID",
                "#ACC",
                "AMOUNT ($)",
              ]}
              onRowClick={(row: any) => setToast(`Analyzing factor: ${row[0]}`)}
              rows={[
                ["Business failure", "0", "0", "0"],
                ["Wrong loan purpose", "0", "0", "0"],
                ["Over-debt", "0", "0", "0"],
                ["Family dispute", "0", "0", "0"],
                ["Collateral issue", "0", "0", "0"],
                ["Business Dispute", "0", "0", "0"],
                ["Fraudulence", "0", "0", "0"],
                ["Gambling", "0", "0", "0"],
                ["Main borrower pass away", "0", "0", "0"],
                ["Other", "0", "0", "0"],
              ]}
              totalRow={["TOTAL", "0", "0", "0"]}
            />
            <ModernSummaryTable
              title='SUMMARY BY "LEGAL ACTION"'
              onRowClick={(row: any) =>
                setToast(`Legal state detail: ${row[0]}`)
              }
              headers={["LEGAL ACTION", "#CID", "#ACC", "AMOUNT ($)"]}
              rows={[
                ["Legal Case", "12", "15", "100,000"],
                ["Non Legal", "4", "6", "200,000"],
                ["Prepare legal action", "4", "6", "200,000"],
              ]}
              totalRow={["TOTAL", "8", "12", "400,000"]}
            />
          </div>

          {/* Center Column */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <ModernSummaryTable
              title='SUMMARY BY "POSSIBLE SOLUTION"'
              onRowClick={(row: any) =>
                setToast(`Remediation strategy: ${row[0]}`)
              }
              headers={["POSSIBLE SOLUTION", "#CID", "#ACC", "AMOUNT ($)"]}
              rows={[
                ["Expect to normalize", "2", "5", "10,000"],
                ["Expect to restructure", "4", "4", "200,000"],
                ["Pay-off", "6", "6", "120,000"],
              ]}
              totalRow={["TOTAL", "12", "15", "330,000"]}
            />
            <ModernSummaryTable
              title='SUMMARY BY "SOLUTION STATUS"'
              onRowClick={(row: any) =>
                setToast(`Execution milestone: ${row[0]}`)
              }
              headers={["SOLUTION STATUS", "#CID", "#ACC", "AMOUNT ($)"]}
              rows={[
                ["Promise to pay", "2", "1", "23,450"],
                ["Already deposited full repayment", "6", "5", "1,000"],
                [
                  "Already deposited some of full repayment",
                  "2",
                  "1",
                  "30,500",
                ],
                ["Request to add loan to settle overdue", "4", "2", "50,607"],
                ["Request to restructure", "2", "1", "34,056"],
                ["Request to grace period", "2", "1", "3,050"],
                ["Request to extend loan", "5", "5", "39,485"],
                ["Request to reduce repayment", "2", "1", "3,204"],
                ["Request to defer principal", "2", "1", "3,204"],
                ["Request to defer interest", "2", "1", "3,204"],
                ["Request to defer principal & interest", "2", "1", "3,204"],
                ["Request to pay-off (close account)", "2", "1", "3,204"],
                ["Request to partial principal", "2", "1", "3,204"],
              ]}
              totalRow={["TOTAL", "35", "22", "201,372"]}
            />
          </div>

          {/* Right Column */}
          <div className="xl:col-span-4 h-full">
            <div className="flex flex-col gap-6 h-full">
              <ModernSummaryTable
                title="NEXT ACTION: RO FOLLOW-UP WITHIN THE NEXT 7 DAYS (T+7)"
                onRowClick={(row: any) => setToast(`Executing task: ${row[0]}`)}
                headers={["NEXT ACTION", "#CID", "#ACC", "AMOUNT ($)"]}
                rows={[
                  ["Will call to customer again", "0", "0", "0"],
                  ["Will conduct site-visit", "0", "0", "0"],
                  ["Will chat again", "0", "0", "0"],
                ]}
                totalRow={["TOTAL", "0", "0", "0"]}
              />
              <div className="flex-1 overflow-y-auto p-6 modern-card rounded-2xl border border-primary/10 bg-primary/[0.03] flex flex-col items-center justify-center text-center shadow-inner cursor-pointer group hover:border-primary/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    auto_awesome
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground uppercase mb-2 tracking-widest">
                  AI Portfolio Prediction
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed px-4">
                  Based on current trends, PAR30+ is expected to decrease by{" "}
                  <span className="text-primary font-bold">1.2%</span> in the
                  next quarter due to aggressive restructuring.
                </p>
                <div className="w-full h-1.5 bg-outline/20 rounded-full mt-5 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "78%" }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
                  ></motion.div>
                </div>
                <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest mt-2">78% Confidence</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
