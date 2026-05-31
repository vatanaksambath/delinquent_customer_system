import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  History,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

export interface MockSiteVisitRecord {
  id: string;
  dateOfVisit: string;
  visitedBy: string;
  keyMatter: string;
}

const MOCK_HISTORY: MockSiteVisitRecord[] = [
  {
    id: "1",
    dateOfVisit: "2026-05-10",
    visitedBy: "Agent A",
    keyMatter:
      "Business experiencing temporary cash flow issues due to delayed payments from main supplier. Requested 3-month restructure.",
  },
  {
    id: "2",
    dateOfVisit: "2025-11-22",
    visitedBy: "Supervisor 01",
    keyMatter:
      "Follow-up visit. Operations are normal, but client is struggling to meet full monthly obligations.",
  },
  {
    id: "3",
    dateOfVisit: "2025-06-15",
    visitedBy: "Agent B",
    keyMatter:
      "Initial site visit. Collateral is in good physical condition. Borrower promised partial payment next week.",
  },
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(MOCK_HISTORY.length / itemsPerPage);

  // Mock reviewing full state
  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);

  // When drawer closes or opens, reset viewing state
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setViewingRecordId(null), 300);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 transition-opacity"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-3xl bg-muted  shadow-2xl z-50 flex flex-col border-l border-border font-sans"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-8 py-5 border-b border-border bg-background/95 backdrop-blur-md shrink-0 flex justify-between items-center shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                    <History className="w-5 h-5 text-muted-foreground " />
                    Site Visit History
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Historical records for{" "}
                  <span className="font-semibold text-card-foreground ">
                    {customerName} ({cid})
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
              {viewingRecordId ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <button
                    onClick={() => setViewingRecordId(null)}
                    className="mb-6 flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50  px-4 py-2 rounded-lg w-fit"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to History Table
                  </button>
                  <div className="bg-card  rounded-2xl shadow-sm border border-border overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 ">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100  flex items-center justify-center text-indigo-600  shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            Site-Visit Report Document
                          </h3>
                          <p className="text-xs font-medium text-muted-foreground mt-0.5">
                            Read-only historical view
                          </p>
                        </div>
                      </div>
                      <div className="bg-muted px-3 py-1.5 rounded-lg border border-border ">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
                          Status
                        </div>
                        <div className="text-xs font-black text-card-foreground ">
                          ARCHIVED
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-muted  p-5 rounded-xl border border-slate-100 ">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1 flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" /> Date of Visit
                          </div>
                          <div className="text-base font-semibold">
                            {
                              MOCK_HISTORY.find((h) => h.id === viewingRecordId)
                                ?.dateOfVisit
                            }
                          </div>
                        </div>
                        <div className="bg-muted  p-5 rounded-xl border border-slate-100 ">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1 flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5" /> Visited By
                          </div>
                          <div className="text-base font-semibold text-indigo-600">
                            {
                              MOCK_HISTORY.find((h) => h.id === viewingRecordId)
                                ?.visitedBy
                            }
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted  p-6 rounded-xl border border-slate-100 ">
                        <div className="text-xs uppercase font-black tracking-widest text-muted-foreground mb-4 border-b border-border  pb-2">
                          Key Matter Discussed
                        </div>
                        <p className="text-sm text-slate-800  leading-relaxed font-medium">
                          {
                            MOCK_HISTORY.find((h) => h.id === viewingRecordId)
                              ?.keyMatter
                          }
                        </p>
                      </div>

                      <div className="flex justify-center pt-8">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          End of Historical Record
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card  rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col h-full max-h-[600px]">
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted ">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted  sticky top-0 uppercase whitespace-nowrap">
                            Date
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted  sticky top-0 uppercase whitespace-nowrap">
                            Visited By
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted  sticky top-0 uppercase">
                            Key Matter Summary
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted  sticky top-0 uppercase text-right whitespace-nowrap">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {MOCK_HISTORY.map((record) => (
                          <tr
                            key={record.id}
                            className="hover:bg-accent/30 transition-colors group"
                          >
                            <td className="px-6 py-5 text-sm font-semibold text-foreground whitespace-nowrap">
                              {record.dateOfVisit}
                            </td>
                            <td className="px-6 py-5 flex items-center">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/80 text-card-foreground  text-xs font-bold whitespace-nowrap border border-border ">
                                <UserIcon className="w-3.5 h-3.5 opacity-60" />
                                {record.visitedBy}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <p
                                className="text-xs font-medium text-muted-foreground  line-clamp-2 leading-relaxed"
                                title={record.keyMatter}
                              >
                                {record.keyMatter}
                              </p>
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              <button
                                onClick={() => setViewingRecordId(record.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-indigo-600  hover:bg-indigo-50  hover:shadow-sm transition-all whitespace-nowrap border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800/50"
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
                  <div className="px-6 py-4 border-t border-border bg-muted  flex items-center justify-between shrink-0">
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
                      <span className="text-[11px] font-black text-card-foreground  uppercase tracking-widest bg-card  px-3 py-1 rounded-md shadow-sm border border-border ">
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

// Quick helper
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
