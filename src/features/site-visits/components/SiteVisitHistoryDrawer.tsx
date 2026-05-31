import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  History,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  Building,
  Calendar,
  DollarSign,
  AlertCircle,
  Briefcase
} from "lucide-react";

export interface MockSiteVisitRecord {
  id: string;
  dateOfVisit: string;
  participant: string;
  
  // Section I: Read-only info mocked for history
  branchName: string;
  outstandingAmt: string;
  dayPastDue: string;
  lroName: string;
  
  npldParticipation: boolean;
  npldName?: string;

  // Section II: Result of Visit
  bizStatus: string;
  borrowerStatus: string;
  
  collateralPhysicalChange: boolean;
  collateralPhysicalRemark?: string;
  
  collateralOwnershipChange: boolean;
  collateralOwnershipRemark?: string;
  
  collateralPriceChange: boolean;
  collateralPriceRemark?: string;

  abilityToResolve: string;
  actionDate?: string;
  solutionStatus?: string;
  customerRequest?: string;
  lroComment: string;
  nextAction?: string;
}

const MOCK_HISTORY: MockSiteVisitRecord[] = [
  {
    id: "1",
    dateOfVisit: "2026-05-10",
    participant: "Robert Smith (RM)",
    branchName: "Main Branch HQ",
    outstandingAmt: "$425,890.00",
    dayPastDue: "112 Days",
    lroName: "LRO-Alpha",
    npldParticipation: true,
    npldName: "Jane Doe (NPLD)",
    bizStatus: "Business experiencing temporary cash flow issues due to delayed payments from main supplier.",
    borrowerStatus: "Cooperative, actively seeking solutions.",
    collateralPhysicalChange: false,
    collateralOwnershipChange: false,
    collateralPriceChange: true,
    collateralPriceRemark: "Property value increased by 5% based on recent area assessments.",
    abilityToResolve: "High",
    actionDate: "2026-06-15",
    solutionStatus: "Negotiation",
    customerRequest: "Requested a 3-month payment holiday.",
    lroComment: "Client is genuine. Recommend granting the request.",
    nextAction: "Submit restructure proposal to credit committee.",
  },
  {
    id: "2",
    dateOfVisit: "2025-11-22",
    participant: "Michael Brown (BM)",
    branchName: "Main Branch HQ",
    outstandingAmt: "$425,890.00",
    dayPastDue: "45 Days",
    lroName: "LRO-Alpha",
    npldParticipation: false,
    bizStatus: "Operations are normal, but client is struggling to meet full monthly obligations.",
    borrowerStatus: "Neutral",
    collateralPhysicalChange: true,
    collateralPhysicalRemark: "Roof needs minor repairs.",
    collateralOwnershipChange: false,
    collateralPriceChange: false,
    abilityToResolve: "Medium",
    actionDate: "2025-12-01",
    solutionStatus: "Monitoring",
    customerRequest: "Asked for lower interest rate.",
    lroComment: "Will review financials next quarter.",
    nextAction: "Follow-up visit in 3 months.",
  },
  {
    id: "3",
    dateOfVisit: "2025-06-15",
    participant: "Robert Smith (RM)",
    branchName: "Main Branch HQ",
    outstandingAmt: "$430,000.00",
    dayPastDue: "0 Days",
    lroName: "LRO-Alpha",
    npldParticipation: false,
    bizStatus: "Business performing well. Expanding to new location.",
    borrowerStatus: "Excellent",
    collateralPhysicalChange: false,
    collateralOwnershipChange: false,
    collateralPriceChange: false,
    abilityToResolve: "Resolved",
    actionDate: "",
    solutionStatus: "Normal",
    customerRequest: "None",
    lroComment: "Initial site visit post-disbursement. Everything looks great.",
    nextAction: "Routine annual review.",
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  cid: string;
}

export function SiteVisitHistoryDrawer({
  isOpen,
  onClose,
  customerName,
  cid,
}: Props) {
  const [currentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(MOCK_HISTORY.length / itemsPerPage);

  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setViewingRecordId(null), 300);
    }
  }, [isOpen]);

  const activeRecord = MOCK_HISTORY.find((h) => h.id === viewingRecordId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[120] transition-opacity duration-300"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 250, mass: 0.8 }}
            className="fixed inset-y-0 right-0 w-full max-w-4xl bg-background shadow-2xl z-[130] flex flex-col border-l border-border font-sans"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-8 py-6 border-b border-border bg-card/95 backdrop-blur-md shrink-0 flex justify-between items-center shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground tracking-tight">
                      Site Visit History
                    </h2>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{customerName}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{cid}</span>
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 bg-muted/30 custom-scrollbar">
              {viewingRecordId && activeRecord ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-3xl mx-auto pb-12">
                  <button
                    onClick={() => setViewingRecordId(null)}
                    className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary hover:brightness-110 transition-colors bg-primary/10 hover:bg-primary/20 border border-primary/20 px-4 py-2.5 rounded-xl w-fit"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to History List
                  </button>
                  
                  <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
                    {/* Record Header */}
                    <div className="px-8 py-6 border-b border-border bg-gradient-to-br from-primary/5 to-transparent flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black tracking-tight text-foreground">
                            Site-Visit Report Document
                          </h3>
                          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {activeRecord.dateOfVisit}
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2 rounded-xl flex items-center gap-2 border font-bold text-xs uppercase tracking-widest bg-muted text-muted-foreground border-border">
                        ARCHIVED
                      </div>
                    </div>

                    <div className="p-8 space-y-8">
                      {/* Section I */}
                      <section>
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-primary/20 flex items-center gap-2">
                          Section I: Customer Information
                        </h4>
                        <div className="grid grid-cols-2 gap-6 bg-muted/30 p-6 rounded-2xl border border-border/50">
                          <DetailItem label="Customer CID" value={cid} />
                          <DetailItem label="Customer Name" value={customerName} />
                          <DetailItem label="Branch Name" value={activeRecord.branchName} />
                          <DetailItem label="Outstanding Amt" value={activeRecord.outstandingAmt} />
                          <DetailItem label="Day Past Due" value={activeRecord.dayPastDue} />
                          <DetailItem label="LRO/RO Name" value={activeRecord.lroName} />
                          <div className="col-span-2 pt-4 border-t border-border/50 grid grid-cols-2 gap-6">
                            <DetailItem label="Date of Site Visit" value={activeRecord.dateOfVisit} />
                            <DetailItem label="Site Visit Participant" value={activeRecord.participant} />
                            <div className="col-span-2">
                              <DetailItem 
                                label="NPLD Participation" 
                                value={activeRecord.npldParticipation ? `Yes - ${activeRecord.npldName}` : "No"} 
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Section II */}
                      <section>
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-primary/20 flex items-center gap-2">
                          Section II: Result of Visit
                        </h4>
                        <div className="grid grid-cols-2 gap-6 bg-muted/30 p-6 rounded-2xl border border-border/50">
                          <div className="col-span-2">
                            <DetailItem label="Status of Business Operation" value={activeRecord.bizStatus} isLongText />
                          </div>
                          <div className="col-span-2">
                            <DetailItem label="Status of Borrower" value={activeRecord.borrowerStatus} isLongText />
                          </div>
                          
                          <div className="col-span-2 py-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-3">
                              Status of Collateral
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-card border border-border p-3 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">1. Physical change?</span>
                                <span className="text-sm font-semibold">{activeRecord.collateralPhysicalChange ? "Yes" : "No"}</span>
                                {activeRecord.collateralPhysicalChange && <p className="text-xs text-muted-foreground mt-1">{activeRecord.collateralPhysicalRemark}</p>}
                              </div>
                              <div className="bg-card border border-border p-3 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">2. Ownership Change?</span>
                                <span className="text-sm font-semibold">{activeRecord.collateralOwnershipChange ? "Yes" : "No"}</span>
                                {activeRecord.collateralOwnershipChange && <p className="text-xs text-muted-foreground mt-1">{activeRecord.collateralOwnershipRemark}</p>}
                              </div>
                              <div className="bg-card border border-border p-3 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">3. Change in Price?</span>
                                <span className="text-sm font-semibold">{activeRecord.collateralPriceChange ? "Yes" : "No"}</span>
                                {activeRecord.collateralPriceChange && <p className="text-xs text-muted-foreground mt-1">{activeRecord.collateralPriceRemark}</p>}
                              </div>
                            </div>
                          </div>

                          <DetailItem label="Ability to Resolve" value={activeRecord.abilityToResolve} />
                          <DetailItem label="Action Date" value={activeRecord.actionDate} />
                          
                          <div className="col-span-2">
                            <DetailItem label="Status of Solution" value={activeRecord.solutionStatus} isLongText />
                          </div>
                          <div className="col-span-2">
                            <DetailItem label="Customer Request/Suggest" value={activeRecord.customerRequest} isLongText />
                          </div>
                          <div className="col-span-2">
                            <DetailItem label="LRO Comment" value={activeRecord.lroComment} isLongText />
                          </div>
                          <div className="col-span-2">
                            <DetailItem label="Next Action" value={activeRecord.nextAction} isLongText />
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col max-w-5xl mx-auto">
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 sticky top-0 whitespace-nowrap">
                            Date
                          </th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 sticky top-0 whitespace-nowrap">
                            Participant
                          </th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 sticky top-0">
                            Key LRO Comment
                          </th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 sticky top-0 text-right whitespace-nowrap">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {MOCK_HISTORY.map((record) => (
                          <tr
                            key={record.id}
                            className="hover:bg-accent/30 transition-colors group cursor-pointer"
                            onClick={() => setViewingRecordId(record.id)}
                          >
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {record.dateOfVisit}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                  <UserIcon className="w-3 h-3" />
                                </div>
                                <span className="text-xs font-bold text-foreground whitespace-nowrap">
                                  {record.participant}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <p className="text-xs font-medium text-muted-foreground line-clamp-2 max-w-[350px]" title={record.lroComment}>
                                {record.lroComment}
                              </p>
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              <button
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between shrink-0">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Showing {MOCK_HISTORY.length} records
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        disabled
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] font-black text-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-md border border-border">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        disabled
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const DetailItem = ({ label, value, isLongText }: { label: string; value: React.ReactNode; isLongText?: boolean }) => (
  <div className="flex flex-col gap-2">
    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1.5">
      {label}
    </div>
    <div className={`text-sm font-semibold text-foreground whitespace-pre-wrap bg-card border border-border/60 shadow-sm rounded-xl px-4 py-3 ${isLongText ? 'min-h-[80px]' : ''}`}>
      {value || "—"}
    </div>
  </div>
);
