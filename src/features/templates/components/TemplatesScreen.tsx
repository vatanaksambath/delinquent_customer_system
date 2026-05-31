import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldAlert,
  List,
  Mailbox,
  Briefcase,
  CalendarClock,
  Check,
  ChevronDown,
  User,
  LayoutTemplate,
  Pencil,
} from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

export default function TemplatesScreen() {
  // Internal Alert Rules State
  const [previewPersona, setPreviewPersona] = useState<"BMRM" | "RO">("BMRM");
  const [triggerType, setTriggerType] = useState("Event-Based");
  const [digestFrequency, setDigestFrequency] = useState("Daily at 8:00 AM");
  const [includeDetailedLedger, setIncludeDetailedLedger] = useState(true);
  const [includeBMRmAlerts, setIncludeBMRmAlerts] = useState(true);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [selectedSummaryMetrics, setSelectedSummaryMetrics] = useState<
    string[]
  >(["count", "balance", "avg_dpd"]);

  const [selectedDetailColumns, setSelectedDetailColumns] = useState<string[]>([
    "name",
    "dpd",
    "note",
  ]);

  const AVAILABLE_SUMMARY_METRICS = [
    { id: "count", label: "Total Count Overdue" },
    { id: "balance", label: "Cumulative Balance at Risk" },
    { id: "avg_dpd", label: "Branch DPD Average" },
    { id: "par_total", label: "Total PAR Portfolio" },
    { id: "high_risk", label: "Highest Single Exposure" },
  ];

  const AVAILABLE_DETAIL_COLUMNS = [
    { id: "name", label: "Customer Name", icon: User },
    { id: "dpd", label: "Exact DPD", icon: ShieldAlert },
    { id: "note", label: "Last Agent Note", icon: List },
    { id: "segment", label: "Account Segment", icon: Briefcase },
    { id: "ptp", label: "PTP Status", icon: CalendarClock },
  ];

  const toggleSummaryMetric = (id: string) => {
    setSelectedSummaryMetrics((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const toggleDetailColumn = (id: string) => {
    setSelectedDetailColumns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveInternalRules = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-muted  font-sans overflow-hidden">
      {/* Top Navbar */}
      <div className="px-8 py-5 shrink-0 bg-card  border-b border-border flex justify-between items-center z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-7 h-7 rounded bg-blue-100  flex items-center justify-center text-blue-600 ">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Templates & Dunning Configuration
            </h1>
          </div>
          <p className="text-muted-foreground text-xs font-medium pl-10">
            Configure internal portfolio risk alerts and automated email
            escalation rules.
          </p>
        </div>
        <button
          onClick={handleSaveInternalRules}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-foreground  text-primary-foreground  rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-2 disabled:opacity-50 shadow-md active:scale-[0.98]"
        >
          {isSubmitting ? "Deploying..." : "Deploy Alert Rules"}
        </button>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Left Sidebar: Logic & Rules Only */}
        <div className="w-[340px] lg:w-[380px] shrink-0 bg-background border-r border-border overflow-y-auto custom-scrollbar flex flex-col p-6 space-y-8">
          {/* Trigger & Frequency Configurations */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-amber-50  flex items-center justify-center text-amber-500">
                <Zap className="w-3 h-3" />
              </div>
              <h2 className="text-sm font-bold text-foreground">
                Trigger Rules
              </h2>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 pl-1">
                Escalation Trigger
              </label>
                <CustomSelect
                  value={triggerType}
                  onChange={setTriggerType}
                  options={["Event-Based (Immediate)", "Scheduled Digests"]}
                  className="w-full h-11 text-sm justify-between"
                />
            </div>

            <AnimatePresence>
              {triggerType === "Scheduled Digests" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative overflow-hidden"
                >
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 pl-1">
                    Digest Frequency
                  </label>
                    <CustomSelect
                      value={digestFrequency}
                      onChange={setDigestFrequency}
                      options={[
                        "Daily at 8:00 AM",
                        "Weekly on Monday Morning",
                        "Bi-Weekly",
                      ]}
                      className="w-full h-11 text-sm justify-between"
                    />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full h-px bg-accent/80"></div>

          {/* Role-Based Payload Configuration */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-emerald-50  flex items-center justify-center text-emerald-500">
                <ShieldAlert className="w-3 h-3" />
              </div>
              <h2 className="text-sm font-bold text-foreground">
                Data Payload
              </h2>
            </div>

            <div className="flex flex-col gap-8">
              {/* BM & RM */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      BM & RM Roles
                    </h3>
                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                      High-Level Parameter Summary
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIncludeBMRmAlerts(!includeBMRmAlerts)}
                    className={`w-10 h-5 rounded-full transition-colors relative outline-none focus:ring-2 focus:ring-blue-500/30 border border-black/5  ${
                      includeBMRmAlerts
                        ? "bg-blue-600"
                        : "bg-accent"
                    }`}
                  >
                    <span className="sr-only">Toggle BM/RM Alerts</span>
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-card shadow-sm absolute top-0.5 transition-transform ${
                        includeBMRmAlerts ? "left-[22px]" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div
                  className={`transition-all ${includeBMRmAlerts ? "opacity-100" : "opacity-40 grayscale pointer-events-none"}`}
                >
                  <div className="flex flex-col gap-1.5">
                    {AVAILABLE_SUMMARY_METRICS.map((metric) => {
                      const isSelected = selectedSummaryMetrics.includes(
                        metric.id,
                      );
                      return (
                        <label
                          key={metric.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-card  border-blue-200  shadow-sm"
                              : "bg-transparent border-transparent hover:bg-accent/50 "
                          }`}
                        >
                          <div className="relative flex shrink-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSummaryMetric(metric.id)}
                              className="sr-only"
                            />
                            <div
                              className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600 text-primary-foreground"
                                  : "border-border  bg-card "
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                          <span
                            className={`text-[13px] font-semibold tracking-tight ${isSelected ? "text-foreground " : "text-muted-foreground "}`}
                          >
                            {metric.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RO */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      RO Roles
                    </h3>
                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                      Atomic-Level Detailed Ledger
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setIncludeDetailedLedger(!includeDetailedLedger)
                    }
                    className={`w-10 h-5 rounded-full transition-colors relative outline-none focus:ring-2 focus:ring-blue-500/30 border border-black/5  ${
                      includeDetailedLedger
                        ? "bg-blue-600"
                        : "bg-accent"
                    }`}
                  >
                    <span className="sr-only">Toggle RO Alerts</span>
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-card shadow-sm absolute top-0.5 transition-transform ${
                        includeDetailedLedger ? "left-[22px]" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div
                  className={`transition-all ${includeDetailedLedger ? "opacity-100" : "opacity-40 grayscale pointer-events-none"}`}
                >
                  <div className="flex flex-col gap-1.5">
                    {AVAILABLE_DETAIL_COLUMNS.map((col) => {
                      const isSelected = selectedDetailColumns.includes(col.id);
                      return (
                        <label
                          key={col.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-card  border-blue-200  shadow-sm"
                              : "bg-transparent border-transparent hover:bg-accent/50 "
                          }`}
                        >
                          <div className="relative flex shrink-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleDetailColumn(col.id)}
                              className="sr-only"
                            />
                            <div
                              className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600 text-primary-foreground"
                                  : "border-border  bg-card "
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                          <span
                            className={`text-[13px] font-semibold tracking-tight ${isSelected ? "text-foreground " : "text-muted-foreground "}`}
                          >
                            {col.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Stage: The "Inline" Email Builder */}
        <div className="flex-1 bg-muted/50  flex flex-col overflow-y-auto custom-scrollbar relative">
          <div className="w-full max-w-4xl mx-auto py-10 px-6 flex flex-col items-center">
            {/* Preview Controls */}
            <div className="inline-flex items-center gap-4 bg-card  p-1.5 rounded-full border border-border  shadow-sm mb-8 shrink-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-4">
                Preview Mode:
              </span>
              <div className="flex">
                <button
                  onClick={() => setPreviewPersona("BMRM")}
                  className={`px-6 py-2 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all ${
                    previewPersona === "BMRM"
                      ? "bg-foreground text-background text-primary-foreground  shadow-md"
                      : "text-muted-foreground hover:text-card-foreground "
                  }`}
                >
                  View as BM/RM
                </button>
                <button
                  onClick={() => setPreviewPersona("RO")}
                  className={`px-6 py-2 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all ${
                    previewPersona === "RO"
                      ? "bg-foreground text-background text-primary-foreground  shadow-md"
                      : "text-muted-foreground hover:text-card-foreground "
                  }`}
                >
                  View as RO
                </button>
              </div>
            </div>

            {/* Email Wrapper */}
            <div className="w-full bg-card  rounded-xl shadow-2xl shadow-slate-900/5 border border-border/80  flex flex-col overflow-hidden relative group/email">
              {/* Mock Window Top Bar */}
              <div className="h-10 bg-muted  border-b border-border flex items-center px-4 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400 "></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400 "></div>
                  <div className="w-3 h-3 rounded-full bg-green-400 "></div>
                </div>
                <div className="mx-auto text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Secure Mail Viewer
                </div>
                <div className="w-10"></div>
              </div>

              {/* Conditional Render for Disabled Views */}
              {previewPersona === "BMRM" && !includeBMRmAlerts && (
                <div className="p-16 flex items-center justify-center bg-muted ">
                  <div className="text-center max-w-sm">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-2">
                      BMRM Alerts Disabled
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      Branch Managers will not receive high-level summaries
                      under the current configuration.
                    </p>
                  </div>
                </div>
              )}

              {previewPersona === "RO" && !includeDetailedLedger && (
                <div className="p-16 flex items-center justify-center bg-muted ">
                  <div className="text-center max-w-sm">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-2">
                      RO Alerts Disabled
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      Relationship Officers will not receive detailed account
                      ledgers under the current configuration.
                    </p>
                  </div>
                </div>
              )}

              {/* Render the actual email when permitted */}
              {((previewPersona === "BMRM" && includeBMRmAlerts) ||
                (previewPersona === "RO" && includeDetailedLedger)) && (
                <div className="flex flex-col">
                  {/* Email Headers with Inline Edit */}
                  <div className="p-8 border-b border-slate-100  bg-card  relative">
                    <div className="absolute top-8 right-8 text-slate-300  pointer-events-none opacity-0 group-hover/email:opacity-100 transition-opacity">
                      <Pencil className="w-5 h-5" />
                    </div>

                    <input
                      type="text"
                      className="w-full text-2xl font-bold text-foreground  mb-6 border-none bg-transparent focus:ring-0 focus:outline-none placeholder-slate-300 dark:placeholder-slate-700"
                      placeholder={
                        triggerType === "Event-Based"
                          ? "URGENT: Portfolio Risk Escalation Alert"
                          : "Daily Portfolio Risk Digest - East Branch"
                      }
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />

                    <div className="flex justify-between items-center bg-muted  p-4 rounded-xl border border-slate-100 ">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-foreground text-background text-primary-foreground  flex items-center justify-center font-bold text-sm">
                          MD
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground -mb-0.5">
                            MDCS Escalation Engine
                          </div>
                          <div className="text-xs font-medium text-muted-foreground">
                            To:{" "}
                            {previewPersona === "BMRM"
                              ? "manager_east@bank.com"
                              : "officer.smith@bank.com"}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted  px-3 py-1.5 rounded-md">
                        {new Date().toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="p-8 flex flex-col gap-8 bg-card  relative">
                    {/* Inline Text Area for Body */}
                    <textarea
                      className="w-full text-sm text-card-foreground  font-medium whitespace-pre-wrap leading-relaxed border-none bg-transparent focus:ring-0 focus:outline-none resize-none placeholder-slate-300 dark:placeholder-slate-700 min-h-[60px]"
                      placeholder="Team, please review the latest risk parameter summary below and action immediately."
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                    />

                    {/* Parameter Summary Component */}
                    <div className="rounded-xl border border-border overflow-hidden shadow-sm">
                      <div className="bg-muted  px-5 py-4 border-b border-border flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                          Parameter Summary
                        </h4>
                        <span className="text-[10px] font-bold text-muted-foreground bg-accent/50  px-2 py-0.5 rounded">
                          AUTO-GENERATED
                        </span>
                      </div>
                      <div className="p-6 grid grid-cols-2 gap-6 bg-card ">
                        {AVAILABLE_SUMMARY_METRICS.filter((m) =>
                          selectedSummaryMetrics.includes(m.id),
                        ).map((metric) => (
                          <div
                            key={metric.id}
                            className="border-l-2 border-border pl-4"
                          >
                            <div className="text-[11px] uppercase font-bold text-muted-foreground mb-1 leading-tight">
                              {metric.label}
                            </div>
                            <div
                              className={`text-2xl font-bold font-mono tracking-tight ${metric.id === "balance" ? "text-red-600 " : metric.id === "avg_dpd" ? "text-amber-600 " : "text-foreground "}`}
                            >
                              {metric.id === "count"
                                ? "24"
                                : metric.id === "balance"
                                  ? "$142,500 HTG"
                                  : metric.id === "avg_dpd"
                                    ? "42 Days"
                                    : metric.id === "par_total"
                                      ? "$2.1M"
                                      : "$85,000 HTG"}
                            </div>
                          </div>
                        ))}
                        {selectedSummaryMetrics.length === 0 && (
                          <div className="col-span-2 text-sm text-muted-foreground italic text-center py-6">
                            No summary metrics selected in payload.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detailed Ledger (Conditional) */}
                    {previewPersona === "RO" &&
                      selectedDetailColumns.length > 0 && (
                        <div className="rounded-xl border border-blue-200  overflow-hidden shadow-sm">
                          <div className="bg-blue-50  px-5 py-3 border-b border-blue-200  flex justify-between items-center">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-900 ">
                              Actionable Item Ledger
                            </h4>
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-100/50  px-2 py-0.5 rounded">
                              DYNAMIC TABLE
                            </span>
                          </div>
                          <div className="flex flex-col gap-0 divide-y divide-slate-100 dark:divide-slate-800">
                            {/* Row 1 */}
                            <div className="p-5 bg-card ">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <User className="w-4 h-4" />
                                  </div>
                                  {selectedDetailColumns.includes("name") && (
                                    <span className="text-sm font-bold text-foreground ">
                                      Customer A
                                    </span>
                                  )}
                                  {!selectedDetailColumns.includes("name") && (
                                    <span className="text-sm font-bold text-muted-foreground italic">
                                      Name Hidden
                                    </span>
                                  )}
                                </div>
                                {selectedDetailColumns.includes("dpd") && (
                                  <span className="px-2.5 py-1 bg-amber-100  text-amber-800  text-[11px] font-black tracking-widest uppercase rounded">
                                    45 DPD
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2.5 pl-11">
                                {selectedDetailColumns.includes("segment") && (
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-16">
                                      Segment:
                                    </span>
                                    <span className="text-xs font-semibold text-card-foreground ">
                                      SME - Retail
                                    </span>
                                  </div>
                                )}
                                {selectedDetailColumns.includes("ptp") && (
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-16">
                                      PTP:
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600 ">
                                      Tomorrow
                                    </span>
                                  </div>
                                )}
                                {selectedDetailColumns.includes("note") && (
                                  <div className="mt-3 bg-muted  p-3 rounded-lg border border-slate-100 ">
                                    <p className="text-xs text-muted-foreground  font-medium italic">
                                      "Called secondary number, went straight to
                                      voicemail. Left standard notification."
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Row 2 */}
                            <div className="p-5 bg-card ">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <User className="w-4 h-4" />
                                  </div>
                                  {selectedDetailColumns.includes("name") && (
                                    <span className="text-sm font-bold text-foreground ">
                                      Customer B
                                    </span>
                                  )}
                                  {!selectedDetailColumns.includes("name") && (
                                    <span className="text-sm font-bold text-muted-foreground italic">
                                      Name Hidden
                                    </span>
                                  )}
                                </div>
                                {selectedDetailColumns.includes("dpd") && (
                                  <span className="px-2.5 py-1 bg-red-100  text-red-800  text-[11px] font-black tracking-widest uppercase rounded">
                                    92 DPD
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2.5 pl-11">
                                {selectedDetailColumns.includes("segment") && (
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-16">
                                      Segment:
                                    </span>
                                    <span className="text-xs font-semibold text-card-foreground ">
                                      Commercial
                                    </span>
                                  </div>
                                )}
                                {selectedDetailColumns.includes("ptp") && (
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-16">
                                      PTP:
                                    </span>
                                    <span className="text-xs font-bold text-muted-foreground ">
                                      None
                                    </span>
                                  </div>
                                )}
                                {selectedDetailColumns.includes("note") && (
                                  <div className="mt-3 bg-muted  p-3 rounded-lg border border-slate-100 ">
                                    <p className="text-xs text-muted-foreground  font-medium italic">
                                      "Customer refused to negotiate terms.
                                      Proceeding to late-stage protocol."
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="bg-muted  p-3 border-t border-blue-100  flex justify-center">
                            <a
                              href="#"
                              className="text-xs font-bold uppercase tracking-widest text-blue-600  hover:text-blue-800 transition-colors flex items-center gap-1"
                            >
                              View Full List in Workspace{" "}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      )}

                    {previewPersona === "BMRM" && (
                      <div className="bg-muted  border border-border border-dashed rounded-xl p-6 text-center">
                        <p className="text-xs font-medium text-muted-foreground max-w-md mx-auto">
                          Detailed client rows are hidden for this role. Only
                          the macro summary is visible. Consult your frontline
                          RO for granular details.
                        </p>
                      </div>
                    )}

                    <div className="pt-8 text-center border-t border-slate-100 ">
                      <p className="text-[10px] text-muted-foreground font-medium">
                        Automated Message from Central Collections System (MDCS)
                        <br />
                        Do not reply directly to this email.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-16 shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
