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
};

const defaultValues: ConfigFormValues = {
  autoDunning: true,
  autoAssign: false,
  maxAccountsPerOfficer: 150,
  excludedBranches: ["branch_3"], // simulated ID
  timezone: "UTC",
  retentionDays: 90,
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full overflow-y-auto bg-muted  custom-scrollbar relative"
    >
      <div className="max-w-4xl mx-auto px-8 py-12 pb-32">
        {/* Header & Metadata Line */}
        <div className="mb-10">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100  flex items-center justify-center text-blue-600 ">
                <Settings className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                System Configuration
              </h1>
            </div>

            {/* The Enterprise Touch: Metadata */}
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest text-right mt-1 bg-accent/50  px-3 py-1.5 rounded-full border border-border/50  shadow-sm backdrop-blur-sm">
              <span className="text-emerald-600  font-bold">
                ● Production
              </span>
              <span className="mx-2 text-slate-300 ">|</span>
              Last updated: Today, 08:30 AM by System Admin
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-medium pl-11">
            Manage global operational parameters, automation rules, and regional
            defaults.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Card: Automation */}
          <div className="bg-card  border border-border rounded-2xl shadow-sm p-8 flex flex-col gap-6">
            <div className="border-b border-slate-100  pb-4 mb-2">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
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
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-blue-600  transition-colors flex items-center gap-1.5 whitespace-nowrap bg-muted hover:bg-blue-50   px-2 py-1 rounded"
                    >
                      <SettingsIcon className="w-3 h-3" /> Configure Rules
                    </button>
                  }
                />
              )}
            />

            <div className="w-full h-px bg-muted/50" />

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
                    <div className="bg-muted  border border-border rounded-xl p-6 flex flex-col md:flex-row gap-6">
                      {/* Max Accounts */}
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
                          Max Accounts per Officer
                        </label>
                        <Controller
                          control={control}
                          name="maxAccountsPerOfficer"
                          render={({ field }) => (
                            <input
                              type="number"
                              {...field}
                              className="w-full px-3 py-2 bg-card  border border-border rounded-lg text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                          )}
                        />
                      </div>

                      {/* Excluded Branches (Multi-select simulation) */}
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
                          Excluded Branches
                        </label>
                        <Controller
                          control={control}
                          name="excludedBranches"
                          render={({ field }) => (
                            <div className="flex flex-col gap-2">
                              {BRANCHES.map((branch) => {
                                const isSelected = field.value.includes(
                                  branch.id,
                                );
                                return (
                                  <label
                                    key={branch.id}
                                    className="flex items-center gap-2 cursor-pointer group"
                                  >
                                    <div
                                      className={cn(
                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                        isSelected
                                          ? "bg-blue-600 border-blue-600 text-primary-foreground"
                                          : "border-border  bg-card  group-hover:border-blue-400",
                                      )}
                                    >
                                      {isSelected && (
                                        <Check className="w-3 h-3" />
                                      )}
                                    </div>
                                    <span className="text-xs font-semibold text-card-foreground ">
                                      {branch.label}
                                    </span>
                                    <input
                                      type="checkbox"
                                      className="sr-only"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          field.onChange([
                                            ...field.value,
                                            branch.id,
                                          ]);
                                        } else {
                                          field.onChange(
                                            field.value.filter(
                                              (id) => id !== branch.id,
                                            ),
                                          );
                                        }
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
          </div>

          {/* Card: Regional & System */}
          <div className="bg-card  border border-border rounded-2xl shadow-sm p-8 flex flex-col gap-8">
            <div className="border-b border-slate-100  pb-4 mb-0">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
                Regional & Data Settings
              </h2>
            </div>

            {/* System Timezone Simulated Combobox */}
            <div className="flex flex-col py-1 relative">
              <label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
                System Timezone
              </label>

              <div className="relative" onClick={() => setTzDropdownOpen(true)}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Search Timezone..."
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
                    // Small delay to allow clicking options
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
                    className="absolute top-[68px] z-10 w-full bg-card  border border-border  rounded-lg shadow-xl max-h-48 overflow-y-auto"
                  >
                    <ul>
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
                                  "px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between",
                                  field.value === tz.value
                                    ? "bg-blue-50  text-blue-700  font-bold"
                                    : "text-card-foreground  hover:bg-muted  font-medium",
                                )}
                                onClick={() => {
                                  field.onChange(tz.value);
                                  setTzDropdownOpen(false);
                                  setTzSearch(tz.label);
                                }}
                              >
                                {tz.label}
                                {field.value === tz.value && (
                                  <Check className="w-4 h-4" />
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

              <span className="text-[11px] font-medium text-muted-foreground  mt-2 leading-relaxed">
                All automated background jobs and reporting exports will run
                relative to this timezone.
              </span>
            </div>

            {/* Audit Log Retention */}
            <div className="flex flex-col py-1">
              <label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
                Audit Log Retention
              </label>

              <div className="relative w-48">
                <Controller
                  control={control}
                  name="retentionDays"
                  rules={{
                    min: {
                      value: 30,
                      message:
                        "Retention under 30 days violates standard compliance.",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <input
                        type="number"
                        {...field}
                        className={cn(
                          "w-full pl-3 pr-12 py-2 bg-background border rounded-lg text-sm font-medium focus:outline-none focus:ring-1 transition-colors",
                          error
                            ? "border-amber-500 text-amber-900  focus:border-amber-500 focus:ring-amber-500 "
                            : "border-border text-foreground focus:border-blue-500 focus:ring-blue-500",
                        )}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-sm text-muted-foreground  font-medium select-none">
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
                    className="text-[11px] font-bold text-amber-600  mt-2 flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.retentionDays.message}
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] font-medium text-muted-foreground  mt-2"
                  >
                    Number of days to keep detailed operational logs before
                    archiving.
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Card: Danger Zone */}
          <div className="bg-card  border border-red-200/50  rounded-2xl shadow-sm p-8 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <div className="border-b border-slate-100  pb-4 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-red-600  uppercase tracking-widest">
                Danger Zone
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col pr-8">
                <span className="text-[13px] font-bold text-foreground">
                  Reset System Defaults
                </span>
                <span className="text-[11px] font-medium text-muted-foreground mt-0.5 leading-relaxed">
                  This action will restore all standard operational settings to
                  factory defaults. Custom rules will be disabled.
                </span>
              </div>
              <button
                type="button"
                className="shrink-0 px-4 py-2 bg-red-500 hover:bg-red-600 text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-sm"
              >
                Reset Defaults
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Global State: The "Dirty" Action Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ml-0 lg:ml-32" // Adjusted for sidebar roughly
          >
            <div className="bg-foreground  text-primary-foreground  px-6 py-4 rounded-xl shadow-2xl flex items-center gap-8 border border-white/10 ">
              <div className="flex flex-col">
                <span className="text-sm font-bold">
                  Unsaved changes detected
                </span>
                <span className="text-[11px] font-medium text-muted-foreground ">
                  Please save or discard your modifications.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onDiscard}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-300  hover:text-primary-foreground  transition-colors flex items-center gap-2"
                >
                  <X className="w-3.5 h-3.5" /> Discard
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Save Configuration
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
