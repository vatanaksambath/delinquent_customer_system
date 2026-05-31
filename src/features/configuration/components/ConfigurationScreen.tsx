import React, { useState } from "react";
import {
  Settings,
  Info,
  AlertTriangle,
  Search,
  Check,
  Save,
  X,
  Settings as SettingsIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useForm, Controller } from "react-hook-form";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// -----------------------------------------------------
// FORM TYPES & DEFAULT VALUES
// -----------------------------------------------------
type ConfigFormValues = {
  autoDunning: boolean;
  autoAssign: boolean;
  maxAccountsPerOfficer: number;
  excludedBranches: string[];
  timezone: string;
  retentionDays: number;
  dailyQueueEnabled: boolean;
  dailyQueueLimit: number;
  queueCriticalFirst: boolean;
};

const defaultValues: ConfigFormValues = {
  autoDunning: true,
  autoAssign: false,
  maxAccountsPerOfficer: 150,
  excludedBranches: ["branch_3"],
  timezone: "UTC",
  retentionDays: 90,
  dailyQueueEnabled: true,
  dailyQueueLimit: 25,
  queueCriticalFirst: true,
};

const BRANCHES = [
  { id: "branch_1", label: "North Region Hub" },
  { id: "branch_2", label: "South Region Hub" },
  { id: "branch_3", label: "East Remote Office" },
  { id: "branch_4", label: "West Remote Office" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "EST", label: "EST (Eastern Standard Time)" },
  { value: "PST", label: "PST (Pacific Standard Time)" },
  { value: "SGT", label: "SGT (Singapore Time)" },
];

// -----------------------------------------------------
// REUSABLE UI COMPONENTS
// -----------------------------------------------------
function ToggleRow({
  title,
  description,
  checked,
  onChange,
  actionRight,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  actionRight?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between py-1">
      <div className="flex flex-col pr-8">
        <span className="text-[13px] font-bold text-foreground">
          {title}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground mt-0.5 leading-relaxed">
          {description}
        </span>
      </div>
      <div className="flex flex-col items-end gap-3 shrink-0">
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
            checked ? "bg-blue-600" : "bg-accent ",
          )}
        >
          <span className="sr-only">Toggle {title}</span>
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow ring-0 transition duration-200 ease-in-out",
              checked ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
        {actionRight}
      </div>
    </div>
  );
}

// -----------------------------------------------------
// MAIN SCREEN COMPONENT
// -----------------------------------------------------
export default function ConfigurationScreen() {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isDirty, errors },
  } = useForm<ConfigFormValues>({
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = (data: ConfigFormValues) => {
    console.log("Saving Configuration:", data);
    // In a real app, this would hit an API. We'll reset it to the new values to clear the dirty state.
    reset(data);
  };

  const onDiscard = () => {
    reset(defaultValues);
  };

  const autoAssignValue = watch("autoAssign");
  const dailyQueueEnabled = watch("dailyQueueEnabled");
  const tzValue = watch("timezone");

  // State for simulated Combobox (Timezone)
  const [tzSearch, setTzSearch] = useState("");
  const [tzDropdownOpen, setTzDropdownOpen] = useState(false);

  // Computed for Timezone Combobox
  const filteredTimezones = TIMEZONES.filter((tz) =>
    tz.label.toLowerCase().includes(tzSearch.toLowerCase()),
  );
  const selectedTzLabel =
    TIMEZONES.find((t) => t.value === tzValue)?.label || "";

  const [activeTab, setActiveTab] = useState<"automation" | "queue" | "regional" | "danger">("automation");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950 dark:to-background custom-scrollbar relative"
    >
      <div className="max-w-5xl mx-auto px-8 py-12 md:py-16 pb-32">
        {/* Premium Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight font-headline">
                System Configuration
              </h1>
            </div>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
              Manage global operational parameters, automation rules, and regional defaults.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-card border border-border/50 px-4 py-2.5 rounded-2xl shadow-sm backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Environment</p>
              <p className="text-sm font-bold text-foreground leading-none">Production</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 bg-card border border-border/60 p-1.5 rounded-2xl shadow-sm overflow-x-auto custom-scrollbar">
          {[
            { id: "automation", label: "Automation & Rules", icon: <SettingsIcon className="w-4 h-4" /> },
            { id: "queue", label: "Daily Queue", icon: <Check className="w-4 h-4" /> },
            { id: "regional", label: "Regional Settings", icon: <Search className="w-4 h-4" /> },
            { id: "danger", label: "Danger Zone", icon: <AlertTriangle className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {activeTab === "automation" && (
              <motion.div
                key="automation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none p-8 flex flex-col gap-6 transition-all hover:border-blue-500/30"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-border/50 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <SettingsIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-base font-extrabold text-foreground tracking-wide">
                    Automation & Rules
                  </h2>
                </div>

                <Controller
                  control={control}
                  name="autoDunning"
                  render={({ field }) => (
                    <ToggleRow
                      title="Automated Dunning Emails"
                      description="Automatically send escalation emails based on configured DPD rules and bucket logic."
                      checked={field.value}
                      onChange={field.onChange}
                      actionRight={
                        <button
                          type="button"
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5 whitespace-nowrap bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800"
                        >
                          <SettingsIcon className="w-3.5 h-3.5" /> Configure Rules
                        </button>
                      }
                    />
                  )}
                />

                <div className="w-full h-px bg-border/40" />

                {/* Auto-Assign PAR Accounts */}
                <div>
                  <Controller
                    control={control}
                    name="autoAssign"
                    render={({ field }) => (
                      <ToggleRow
                        title="Auto-Assign PAR Accounts"
                        description="Automatically assign new PAR accounts to Relationship Officers based on load balancing."
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  {/* Conditional Depth Panel */}
                  <AnimatePresence>
                    {autoAssignValue && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-6"
                      >
                        <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-border/50 rounded-2xl p-6 flex flex-col md:flex-row gap-8">
                          {/* Max Accounts */}
                          <div className="flex-1">
                            <label className="block text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-3">
                              Max Accounts per Officer
                            </label>
                            <Controller
                              control={control}
                              name="maxAccountsPerOfficer"
                              render={({ field }) => (
                                <input
                                  type="number"
                                  {...field}
                                  className="w-full px-4 py-3 bg-card border border-border/60 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                                />
                              )}
                            />
                          </div>

                          {/* Excluded Branches */}
                          <div className="flex-1">
                            <label className="block text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-3">
                              Excluded Branches
                            </label>
                            <Controller
                              control={control}
                              name="excludedBranches"
                              render={({ field }) => (
                                <div className="grid grid-cols-2 gap-3">
                                  {BRANCHES.map((branch) => {
                                    const isSelected = field.value.includes(branch.id);
                                    return (
                                      <label
                                        key={branch.id}
                                        className={cn(
                                          "flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all duration-200 group",
                                          isSelected
                                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                            : "bg-card border-border/60 hover:border-blue-300"
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "w-5 h-5 rounded-md border flex items-center justify-center transition-colors shadow-sm shrink-0",
                                            isSelected
                                              ? "bg-blue-600 border-blue-600 text-white"
                                              : "border-border/80 bg-background group-hover:border-blue-400",
                                          )}
                                        >
                                          {isSelected && <Check className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className={cn(
                                          "text-xs font-semibold leading-tight",
                                          isSelected ? "text-blue-900 dark:text-blue-100" : "text-foreground"
                                        )}>
                                          {branch.label}
                                        </span>
                                        <input
                                          type="checkbox"
                                          className="sr-only"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            if (e.target.checked) field.onChange([...field.value, branch.id]);
                                            else field.onChange(field.value.filter((id) => id !== branch.id));
                                          }}
                                        />
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === "queue" && (
              <motion.div
                key="queue"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none p-8 flex flex-col gap-6 transition-all hover:border-blue-500/30"
              >
                <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-base font-extrabold text-foreground tracking-wide">
                      Daily Queue &amp; Worklist
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                    Agent Productivity
                  </span>
                </div>

                <Controller
                  control={control}
                  name="dailyQueueEnabled"
                  render={({ field }) => (
                    <ToggleRow
                      title="Auto-Push Cases to Agent Worklist"
                      description="Automatically push high-priority cases (broken PTPs, high-risk DPD, escalations) into each agent's daily queue every morning at 07:00 AM."
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <AnimatePresence>
                  {dailyQueueEnabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-border/50 rounded-2xl p-6 mt-2 flex flex-col gap-8">
                        <div className="flex flex-col md:flex-row gap-8">
                          {/* Max cases per agent */}
                          <div className="flex-1">
                            <label className="block text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-1">
                              Max Cases Per Agent Per Day
                            </label>
                            <p className="text-xs text-muted-foreground mb-4">
                              System will auto-push up to this many accounts into each agent's daily queue.
                            </p>
                            <div className="relative w-48">
                              <Controller
                                control={control}
                                name="dailyQueueLimit"
                                rules={{ min: { value: 1, message: "Must be at least 1." }, max: { value: 200, message: "Cannot exceed 200." } }}
                                render={({ field, fieldState: { error } }) => (
                                  <>
                                    <input
                                      type="number"
                                      {...field}
                                      className={cn(
                                        "w-full pl-4 pr-16 py-3 bg-card border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all shadow-sm",
                                        error ? "border-amber-500 focus:border-amber-500 focus:ring-amber-500/20" : "border-border/60 text-foreground focus:border-blue-500 focus:ring-blue-500/20"
                                      )}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider select-none">cases</span>
                                    </div>
                                    {error && (
                                      <p className="text-[11px] font-bold text-amber-600 mt-2 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5" />{error.message}
                                      </p>
                                    )}
                                  </>
                                )}
                              />
                            </div>
                          </div>

                          {/* Sort order */}
                          <div className="flex-1 pt-2">
                            <Controller
                              control={control}
                              name="queueCriticalFirst"
                              render={({ field }) => (
                                <ToggleRow
                                  title="Prioritize Critical Cases First"
                                  description="Sort the daily queue so Critical-priority accounts always appear at the top, followed by High then Medium."
                                  checked={field.value}
                                  onChange={field.onChange}
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/30 rounded-xl p-5 flex items-start gap-3 shadow-inner">
                          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-300 leading-relaxed">
                            <strong className="text-blue-950 dark:text-blue-200">How it works:</strong> Every day at 07:00 AM, the Bucket Rules engine evaluates all delinquent accounts. Accounts matching any active bucket rule (e.g., DPD ≥ 30, broken PTP, high-risk profile) are ranked by severity and pushed to the assigned agent's worklist, capped at the limit above.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === "regional" && (
              <motion.div
                key="regional"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none p-8 flex flex-col gap-8 transition-all hover:border-blue-500/30"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-base font-extrabold text-foreground tracking-wide">
                    Regional & Data Settings
                  </h2>
                </div>

                {/* System Timezone Simulated Combobox */}
                <div className="flex flex-col py-1 relative">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-3">
                    System Timezone
                  </label>

                  <div className="relative max-w-md" onClick={() => setTzDropdownOpen(true)}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search Timezone..."
                      className="w-full pl-11 pr-4 py-3 bg-card border border-border/60 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm cursor-pointer"
                      value={tzDropdownOpen ? tzSearch : selectedTzLabel}
                      onChange={(e) => {
                        setTzSearch(e.target.value);
                        setTzDropdownOpen(true);
                      }}
                      onFocus={() => {
                        setTzDropdownOpen(true);
                        setTzSearch("");
                      }}
                      onBlur={() => {
                        setTimeout(() => setTzDropdownOpen(false), 200);
                      }}
                    />
                  </div>

                  {/* Combobox Dropdown */}
                  <AnimatePresence>
                    {tzDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute top-[85px] z-20 max-w-md w-full bg-card border border-border/80 rounded-xl shadow-2xl max-h-56 overflow-y-auto"
                      >
                        <ul className="p-1">
                          {filteredTimezones.length === 0 && (
                            <li className="px-4 py-3 text-sm text-muted-foreground text-center">
                              No timezones found.
                            </li>
                          )}
                          <Controller
                            control={control}
                            name="timezone"
                            render={({ field }) => (
                              <>
                                {filteredTimezones.map((tz) => (
                                  <li
                                    key={tz.value}
                                    className={cn(
                                      "px-4 py-3 text-sm rounded-lg cursor-pointer transition-colors flex items-center justify-between",
                                      field.value === tz.value
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold"
                                        : "text-foreground hover:bg-muted font-medium",
                                    )}
                                    onClick={() => {
                                      field.onChange(tz.value);
                                      setTzDropdownOpen(false);
                                      setTzSearch(tz.label);
                                    }}
                                  >
                                    {tz.label}
                                    {field.value === tz.value && (
                                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    )}
                                  </li>
                                ))}
                              </>
                            )}
                          />
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <span className="text-xs font-medium text-muted-foreground mt-3 leading-relaxed">
                    All automated background jobs and reporting exports will run relative to this timezone.
                  </span>
                </div>

                {/* Audit Log Retention */}
                <div className="flex flex-col py-1">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-3">
                    Audit Log Retention
                  </label>

                  <div className="relative w-48">
                    <Controller
                      control={control}
                      name="retentionDays"
                      rules={{
                        min: { value: 30, message: "Retention under 30 days violates standard compliance." },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <input
                            type="number"
                            {...field}
                            className={cn(
                              "w-full pl-4 pr-14 py-3 bg-card border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all shadow-sm",
                              error
                                ? "border-amber-500 text-amber-900 focus:border-amber-500 focus:ring-amber-500/20"
                                : "border-border/60 text-foreground focus:border-blue-500 focus:ring-blue-500/20",
                            )}
                          />
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider select-none">
                              Days
                            </span>
                          </div>
                        </>
                      )}
                    />
                  </div>

                  <AnimatePresence mode="popLayout">
                    {errors.retentionDays ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs font-bold text-amber-600 mt-3 flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {errors.retentionDays.message}
                      </motion.div>
                    ) : (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs font-medium text-muted-foreground mt-3"
                      >
                        Number of days to keep detailed operational logs before archiving.
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === "danger" && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-rose-200/50 dark:border-rose-900/50 rounded-3xl shadow-sm p-8 flex flex-col gap-4 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 group-hover:w-2 transition-all" />
                <div className="flex items-center gap-3 pb-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h2 className="text-base font-extrabold text-rose-600 dark:text-rose-400 tracking-wide">
                    Danger Zone
                  </h2>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pl-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground mb-1">
                      Reset System Defaults
                    </span>
                    <span className="text-xs font-medium text-muted-foreground leading-relaxed max-w-xl">
                      This action will restore all standard operational settings to factory defaults. Custom rules and overrides will be permanently disabled.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rose-500/20"
                  >
                    Reset Defaults
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Global State: The "Dirty" Action Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 ml-0 lg:ml-12"
          >
            <div className="bg-foreground text-background px-6 py-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-6 sm:gap-10 border border-white/10">
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-sm font-bold">
                  Unsaved changes detected
                </span>
                <span className="text-xs font-medium text-muted-foreground mt-0.5">
                  Please save or discard your modifications.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onDiscard}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2 rounded-xl hover:bg-white/10"
                >
                  <X className="w-4 h-4" /> Discard
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" /> Save Configuration
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
