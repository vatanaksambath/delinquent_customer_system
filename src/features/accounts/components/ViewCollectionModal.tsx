import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LedgerEntry } from "@/types";

interface ViewCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: LedgerEntry | null;
  onTrackSiteVisit?: (entry: LedgerEntry) => void;
  onViewSiteVisit?: (entry: LedgerEntry) => void;
}

export function ViewCollectionModal({
  isOpen,
  onClose,
  entry,
  onTrackSiteVisit,
  onViewSiteVisit,
}: ViewCollectionModalProps) {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "LOAN" | "LEGAL" | "RESOLUTION">("OVERVIEW");
  
  if (!entry) return null;

  const isCritical = entry.past_due > 90;
  const isWarning = entry.past_due > 30 && entry.past_due <= 90;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 dark:bg-slate-900/70 backdrop-blur-[8px] z-[100] transition-opacity duration-300"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-5xl max-h-[90vh] bg-card border border-border shadow-2xl rounded-3xl flex flex-col overflow-hidden"
            >
              <div className="px-8 pt-6 pb-0 border-b border-border bg-muted/30 flex flex-col shrink-0 gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                        isCritical
                          ? "bg-rose-500/10 text-rose-500"
                          : isWarning
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-emerald-500/10 text-emerald-500"
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        person
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-foreground">
                        {entry.customer_name}
                      </h2>
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span>{entry.cid}</span>
                        <span className="w-1 h-1 rounded-full bg-outline/50" />
                        <span>{entry.account_number}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-6">
                  {(["OVERVIEW", "LOAN", "LEGAL", "RESOLUTION"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 px-1 text-[11px] font-black uppercase tracking-widest transition-all relative ${
                        activeTab === tab
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.replace("_", " ")}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col gap-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-8"
                  >
                    {activeTab === "OVERVIEW" && (
                      <>
                        {/* Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/40 rounded-2xl p-4 border border-border/50 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Outstanding Balance
                  </span>
                  <span className="text-lg font-black text-foreground tabular-nums">
                    ${entry.usd_equivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-muted/40 rounded-2xl p-4 border border-border/50 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Days Past Due
                  </span>
                  <span
                    className={`text-lg font-black tabular-nums ${
                      isCritical ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-500"
                    }`}
                  >
                    {entry.past_due} Days
                  </span>
                </div>
                <div className="bg-muted/40 rounded-2xl p-4 border border-border/50 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Customer Grade
                  </span>
                  <span className="text-lg font-black text-primary">
                    {entry.customer_grade || "N/A"}
                  </span>
                </div>
              </div>

              {/* Corporate Information */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="material-symbols-outlined text-primary text-xl">
                    domain
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                    Corporate Information
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                  <DetailItem label="Branch Name" value={entry.branch_name || entry.branch_code} />
                  <DetailItem label="Division" value={entry.division} />
                  <DetailItem label="Department" value={entry.department} />
                  <DetailItem label="Industry Type" value={entry.industry_type} />
                  <DetailItem label="Business Type" value={entry.business_type || entry.buss_type} />
                  <DetailItem label="Phone Number" value={entry.phone_number} />
                  <DetailItem label="LRO Name" value={entry.lro_name} />
                  <DetailItem label="RM Name" value={entry.rm_name} />
                  </div>
                </section>
              </>
            )}

            {activeTab === "LOAN" && (
              <>
                {/* Loan Details Section */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="material-symbols-outlined text-primary text-xl">
                    account_balance
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                    Facility Details
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                  <DetailItem label="Loan Class" value={entry.loan_class} />
                  <DetailItem label="Loan Facility" value={entry.loan_facility} />
                  <DetailItem label="Currency" value={entry.currency} />
                  <DetailItem label="Contract Date" value={entry.cont_date} />
                  <DetailItem label="Maturity Date" value={entry.mat_date} />
                  <DetailItem label="Interest Rate" value={`${entry.pro_rate || 0}%`} />
                  <DetailItem label="Total Accrued" value={`$${entry.total_accrued?.toLocaleString()}`} />
                  <DetailItem label="Overdue Principal" value={`$${entry.ovrdue_pr?.toLocaleString()}`} />
                  <DetailItem label="Collateral Value" value={`$${entry.c_value?.toLocaleString()}`} />
                  <DetailItem label="Initial Loan Officer" value={entry.init_loan_officer} />
                  <DetailItem label="Current Loan Officer" value={entry.loan_officer} />
                  </div>
                </section>
              </>
            )}

            {activeTab === "LEGAL" && (
              <>
                {/* Default & Legal Status */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="material-symbols-outlined text-primary text-xl">
                    gavel
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                    Default & Legal Status
                  </h3>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 grid grid-cols-3 gap-x-8 gap-y-6">
                  <DetailItem label="Reason of Loan Default" value={entry.reason_loan_default || entry.root_cause} />
                  <DetailItem label="Legal Action" value={entry.legal_action} />
                  <DetailItem label="Date of Approval (Legal)" value={entry.date_approval_legal} />
                  <DetailItem label="Legal Stage" value={entry.legal_stage} />
                  <div className="col-span-2">
                    <DetailItem label="Legal Remarks" value={entry.remark_legal} />
                  </div>
                </div>
              </section>

              {/* Collection & Monitoring Info */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="material-symbols-outlined text-primary text-xl">
                    monitor_heart
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                    Monitoring Status
                  </h3>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 grid grid-cols-2 gap-x-8 gap-y-6">
                  <DetailItem label="Delinquency Status" value={entry.delinquency_status} />
                  <DetailItem label="Root Cause" value={entry.root_cause} />
                  <DetailItem label="Possible Solution" value={entry.possible_solution} />
                  <DetailItem label="Solution Status" value={entry.solution_status} />
                  <DetailItem label="Next Action" value={entry.next_action} />
                  <DetailItem label="Expected Date" value={entry.expected_date} />
                  <div className="col-span-2">
                    <DetailItem label="General Remarks" value={entry.remarks} />
                  </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === "RESOLUTION" && (
              <>
                {/* Form Input Data - Dynamic */}
                {(entry.channel_contact || entry.status_call_visit || entry.meet_possible_solution || entry.not_meet_next_action) ? (
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 border-b border-border pb-2">
                    <span className="material-symbols-outlined text-primary text-xl">
                      contact_phone
                    </span>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                      Resolution Pathway / Protocol
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-x-8 gap-y-6 mb-4">
                    <DetailItem label="Contact Channel" value={entry.channel_contact} />
                    <DetailItem label="Date of Contact" value={entry.date_of_contact} />
                    <DetailItem label="Status of Visit" value={entry.status_call_visit} />
                  </div>
                  
                  {entry.status_call_visit === "Meet" && (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 grid grid-cols-3 gap-x-8 gap-y-6">
                      <div className="col-span-3 pb-2 border-b border-primary/10">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary">Meet Protocol Details</h4>
                      </div>
                      <DetailItem label="Possible Solution" value={entry.meet_possible_solution} />
                      <DetailItem label="Specific Resolution" value={entry.meet_specific_resolution} />
                      <DetailItem label="Solution Status" value={entry.meet_solution_status} />
                      <DetailItem label="Expected Date" value={entry.meet_expected_date} />
                      <DetailItem label="Call Log Report" value={entry.meet_call_log} />
                      <DetailItem label="Issue Letter" value={entry.meet_issue_letter} />
                      <DetailItem label="Delivery Channel" value={entry.meet_delivery_channel} />
                      <DetailItem label="Date of Delivery" value={entry.meet_date_delivery} />
                      <DetailItem label="Recovery Report" value={entry.meet_recovery_report} />
                      <DetailItem label="None Solution" value={entry.meet_none_solution} />
                      <DetailItem label="Action Progress" value={entry.meet_action_progress} />
                      <DetailItem label="Date of Submit" value={entry.meet_date_submit} />
                      <div className="col-span-3">
                        <DetailItem label="Meet Remark" value={entry.meet_remark} />
                      </div>
                      {entry.meet_none_remark && (
                        <div className="col-span-3 mt-2">
                          <DetailItem label="None Remark" value={entry.meet_none_remark} />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {entry.status_call_visit === "Not Meet" && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 grid grid-cols-3 gap-x-8 gap-y-6">
                      <div className="col-span-3 pb-2 border-b border-amber-500/10">
                        <h4 className="text-xs font-black uppercase tracking-widest text-amber-500">Not Meet Protocol Details</h4>
                      </div>
                      <DetailItem label="Next Action" value={entry.not_meet_next_action} />
                      <DetailItem label="Expected Date" value={entry.not_meet_date} />
                      <DetailItem label="Call Log Report" value={entry.not_meet_call_log} />
                      <DetailItem label="Issue Letter" value={entry.not_meet_issue_letter} />
                      <DetailItem label="Delivery Channel" value={entry.not_meet_delivery_channel} />
                      <DetailItem label="Date of Delivery" value={entry.not_meet_date_delivery} />
                      <DetailItem label="Recovery Report" value={entry.not_meet_recovery_report} />
                      <div className="col-span-3">
                        <DetailItem label="Not Meet Remark" value={entry.not_meet_remark} />
                      </div>
                    </div>
                  )}
                  </section>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 border border-border/50 rounded-2xl border-dashed">
                    <span className="material-symbols-outlined text-4xl text-muted-foreground mb-4 opacity-50">
                      folder_open
                    </span>
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-1">
                      No Resolution Protocol Active
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      There are currently no active Meet or Not Meet protocols logged for this account.
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
            
            {/* Footer */}
            <div className="px-8 py-5 border-t border-border bg-card shrink-0 flex justify-end gap-3">
              {onTrackSiteVisit && (
                <button
                  onClick={() => {
                    onTrackSiteVisit(entry);
                  }}
                  className="h-10 px-6 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    timeline
                  </span>
                  Track Approval
                </button>
              )}
              {onViewSiteVisit && (
                <button
                  onClick={() => {
                    onViewSiteVisit(entry);
                  }}
                  className="h-10 px-6 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    visibility
                  </span>
                  View Site Visit Data
                </button>
              )}
              <button
                onClick={onClose}
                className="h-10 px-8 rounded-xl bg-muted text-foreground text-[11px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all active:scale-95"
              >
                Close View
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
      {label}
    </span>
    <span className="text-xs font-semibold text-foreground whitespace-pre-wrap">
      {value || "—"}
    </span>
  </div>
);
