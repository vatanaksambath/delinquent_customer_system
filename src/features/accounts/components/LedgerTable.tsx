import React, { useState, useMemo, useRef, useEffect } from "react";
import { LedgerEntry, ALL_COLUMNS, DEFAULT_VISIBLE } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";
import { ViewCollectionModal } from "./ViewCollectionModal";

export { FilterDropdown, ExportDropdown, RowActionMenu };

type SortConfig = {
  key: keyof LedgerEntry | null;
  direction: "asc" | "desc";
};

const FilterDropdown = ({
  icon,
  value,
  options,
  onChange,
}: {
  icon: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel =
    options.find((o) => o.value === value)?.label || options[0].label;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className={`relative flex items-center gap-1.5 border border-border  rounded-lg px-2 py-1.5 bg-card  min-w-[140px] group hover:border-primary/40 transition-all shadow-sm cursor-pointer select-none ${isOpen ? "z-[100] border-primary/50 ring-1 ring-primary/20" : "z-10"}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span className="material-symbols-outlined text-[16px] text-muted-foreground">
        {icon}
      </span>
      <div className="flex-1 text-[9px] font-bold uppercase tracking-widest text-foreground relative top-[0.5px] truncate">
        {selectedLabel}
      </div>
      <span
        className={`material-symbols-outlined text-xs text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      >
        expand_more
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-[calc(100%+6px)] w-full min-w-[180px] bg-card  border border-border  rounded-lg shadow-2xl z-[150] overflow-hidden py-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors flex items-center justify-between ${
                  value === opt.value
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted  hover:text-foreground"
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
                {value === opt.value && (
                  <span className="material-symbols-outlined text-[14px]">
                    check
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ALL_COLUMNS_INTERNAL = ALL_COLUMNS;

const RowActionMenu = ({
  entry,
  onAction,
  onTrackSiteVisit,
  onView,
}: {
  entry: LedgerEntry;
  onAction?: (entry: LedgerEntry) => void;
  onTrackSiteVisit?: (entry: LedgerEntry) => void;
  onView?: (entry: LedgerEntry) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`w-5 h-5 flex items-center justify-center rounded-full transition-all cursor-pointer ${
          isOpen
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-primary"
        }`}
      >
        <span className="material-symbols-outlined text-[14px]">more_vert</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-1 bg-card  border border-border  rounded-lg shadow-xl z-[200] min-w-[150px] overflow-hidden py-1"
          >
            <button
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted  hover:text-primary transition-colors text-left"
              onClick={() => {
                setIsOpen(false);
                onView?.(entry);
              }}
            >
              <span className="material-symbols-outlined text-base">
                visibility
              </span>
              View
            </button>
            <div className="h-[1px] bg-outline/20 mx-2 my-1"></div>
            <button
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted  hover:text-primary transition-colors text-left"
              onClick={() => {
                setIsOpen(false);
                onAction?.(entry);
              }}
            >
              <span className="material-symbols-outlined text-base">
                perm_phone_msg
              </span>
              Call/Site Visit
            </button>
            <div className="h-[1px] bg-outline/20 mx-2 my-1"></div>
            <button
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted  hover:text-primary transition-colors text-left"
              onClick={() => {
                setIsOpen(false);
                onTrackSiteVisit?.(entry);
              }}
            >
              <span className="material-symbols-outlined text-base">
                timeline
              </span>
              Track Site Visit
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ExportDropdown = ({ data }: { data: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (type: "csv" | "xlsx") => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LedgerData");

    const timestamp = new Date().toISOString().split("T")[0];
    const fileName = `Sovereign_Ledger_Export_${timestamp}.${type}`;

    XLSX.writeFile(workbook, fileName);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap focus:ring-2 focus:ring-blue-500/30 outline-none"
      >
        <span className="material-symbols-outlined text-[16px]">download</span>
        Export
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="material-symbols-outlined text-[16px] ml-1 opacity-80"
        >
          expand_more
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+6px)] w-48 bg-card border border-border rounded-xl shadow-xl z-[150] overflow-hidden py-1.5 flex flex-col"
          >
            <button
              onClick={() => handleExport("csv")}
              className="w-full flex items-center px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5 w-full">
                <span className="material-symbols-outlined text-[18px] text-blue-500 group-hover:scale-110 transition-transform duration-200">
                  csv
                </span>
                <span className="flex-1 mt-0.5">Export CSV</span>
              </div>
            </button>
            <div className="mx-3 my-0.5 h-[1px] bg-border"></div>
            <button
              onClick={() => handleExport("xlsx")}
              className="w-full flex items-center px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5 w-full">
                <span className="material-symbols-outlined text-[18px] text-emerald-500 group-hover:scale-110 transition-transform duration-200">
                  table_chart
                </span>
                <span className="flex-1 mt-0.5">Export Excel</span>
              </div>
            </button>
            <div className="mx-3 my-0.5 h-[1px] bg-border"></div>
            <button
              onClick={() => {
                window.focus();
                setIsOpen(false);
                setTimeout(() => {
                  window.print();
                }, 20);
              }}
              className="w-full flex items-center px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5 w-full">
                <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:scale-110 transition-transform duration-200">
                  print
                </span>
                <span className="flex-1 mt-0.5">Print Table</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface LedgerTableProps {
  data: LedgerEntry[];
  visibleColumns: (keyof LedgerEntry)[];
  setVisibleColumns: React.Dispatch<
    React.SetStateAction<(keyof LedgerEntry)[]>
  >;
  showColumnPicker: boolean;
  setShowColumnPicker: React.Dispatch<React.SetStateAction<boolean>>;
  filterBalance: string;
  setFilterBalance: (val: string) => void;
  filterGrade: string;
  setFilterGrade: (val: string) => void;
  globalSearch: string;
  setGlobalSearch: (val: string) => void;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  sortConfig: SortConfig;
  onSort: (key: keyof LedgerEntry) => void;
  columns?: { key: keyof LedgerEntry; label: string; mandatory?: boolean }[];
  onCallSiteVisit?: (entry: LedgerEntry) => void;
  onTrackSiteVisit?: (entry: LedgerEntry) => void;
  onViewSiteVisit?: (entry: LedgerEntry) => void;
}

export default function LedgerTable({
  data,
  visibleColumns,
  setVisibleColumns,
  showColumnPicker,
  setShowColumnPicker,
  filterBalance,
  setFilterBalance,
  filterGrade,
  setFilterGrade,
  globalSearch,
  setGlobalSearch,
  showFilters,
  setShowFilters,
  currentPage,
  setCurrentPage,
  sortConfig,
  onSort,
  columns = ALL_COLUMNS,
  onCallSiteVisit,
  onTrackSiteVisit,
  onViewSiteVisit,
}: LedgerTableProps) {
  const [columnSearch, setColumnSearch] = useState("");
  const [viewData, setViewData] = useState<LedgerEntry | null>(null);
  const rowsPerPage = 10;

  const mandatoryKeys = useMemo(
    () => columns.filter((c) => c.mandatory).map((c) => c.key),
    [columns],
  );

  const filteredColumns = useMemo(() => {
    return columns.filter((c) =>
      c.label.toLowerCase().includes(columnSearch.toLowerCase()),
    );
  }, [columnSearch, columns]);

  const selectAll = () => setVisibleColumns(columns.map((c) => c.key));
  const deselectAll = () => setVisibleColumns(mandatoryKeys);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const toggleColumn = (key: keyof LedgerEntry) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-transparent overflow-hidden">
      <AnimatePresence>
        {showColumnPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowColumnPicker(false)}
              className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed inset-0 m-auto w-[90vw] max-w-4xl max-h-[85vh] bg-card text-muted-foreground border border-border rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col font-sans"
            >
              {/* Top Header */}
              <div className="px-8 py-6 bg-card shrink-0 border-b border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight font-headline">
                      Customize Columns
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                      Select visibility of data fields. Mandatory columns are locked.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowColumnPicker(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">
                      close
                    </span>
                  </button>
                </div>

                {/* Controls Bar */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="relative w-full max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-lg">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder={`Search ${columns.length} columns...`}
                      value={columnSearch}
                      onChange={(e) => setColumnSearch(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-10 py-2.5 text-xs font-bold tracking-wide text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <button
                      onClick={selectAll}
                      className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAll}
                      className="px-4 py-2 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid content container */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-muted/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredColumns.map((col) => {
                    const isMandatory = col.mandatory;
                    const isSelected = visibleColumns.includes(col.key);

                    return (
                      <label
                        key={col.key}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all select-none ${
                          isMandatory
                            ? "bg-muted border-border opacity-80 cursor-not-allowed"
                            : isSelected
                              ? "bg-card border-primary/40 shadow-md shadow-primary/5 cursor-pointer hover:border-primary/60 transform hover:-translate-y-0.5"
                              : "bg-card border-border hover:border-primary/30 cursor-pointer shadow-sm hover:shadow"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isMandatory}
                          onChange={() => toggleColumn(col.key)}
                          className="hidden"
                        />
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                            isMandatory
                              ? "bg-accent border-border text-muted-foreground"
                              : isSelected
                                ? "bg-primary border-primary text-primary-foreground shadow-inner shadow-black/20"
                                : "border-border bg-background"
                          }`}
                        >
                          {isMandatory ? (
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                          ) : isSelected ? (
                            <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                          ) : null}
                        </div>
                        <div className="flex-1 truncate">
                          <span
                            className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
                              isMandatory
                                ? "text-muted-foreground"
                                : isSelected
                                  ? "text-primary"
                                  : "text-foreground"
                            }`}
                          >
                            {col.label}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {filteredColumns.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-3xl text-muted-foreground/50">search_off</span>
                    </div>
                    <p className="text-sm font-bold text-foreground">No columns found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-5 flex justify-between items-center bg-card shrink-0 border-t border-border">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[14px]">view_column</span>
                    {visibleColumns.length} Selected
                  </div>
                  <span className="text-outline">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    {mandatoryKeys.length} Mandatory
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowColumnPicker(false)}
                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowColumnPicker(false)}
                    className="bg-primary text-on-primary text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded-xl hover:brightness-110 shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Apply Configuration
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto min-h-0 bg-card  selection:bg-primary/20 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-max relative table-fixed">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-md">
            <tr className="text-[7px] text-muted-foreground uppercase font-bold tracking-[0.25em] border-b border-border">
              {columns
                .filter((col) => visibleColumns.includes(col.key))
                .map((col) => (
                  <th
                    key={col.key}
                    className="py-4 px-4 cursor-pointer transition-colors select-none font-headline"
                    onClick={() => onSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      <span
                        className={`material-symbols-outlined text-[10px] transition-all ${
                          sortConfig.key === col.key
                            ? "opacity-100 text-primary"
                            : "opacity-0"
                        }`}
                      >
                        {sortConfig.key === col.key &&
                        sortConfig.direction === "desc"
                          ? "keyboard_arrow_down"
                          : "keyboard_arrow_up"}
                      </span>
                    </div>
                  </th>
                ))}
              <th className="py-4 px-4 text-center font-headline w-20 bg-muted/40">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody className="text-[10.5px] divide-y divide-outline/5">
            {paginatedData.map((entry, idx) => (
              <tr
                key={idx}
                className="bg-transparent border-l-2 border-transparent transition-all duration-200 hover:bg-card  cursor-pointer"
                onClick={() => onCallSiteVisit && onCallSiteVisit(entry)}
              >
                {columns
                  .filter((col) => visibleColumns.includes(col.key))
                  .map((col) => {
                    const val = entry[col.key];
                    const displayValue =
                      val instanceof File
                        ? val.name
                        : typeof val === "number"
                          ? col.key.includes("date")
                            ? val
                            : col.key === "past_due"
                              ? val
                              : col.key === "pro_rate"
                                ? `${val}%`
                                : new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    maximumFractionDigits: 0,
                                  }).format(val)
                          : (val as React.ReactNode);

                    if (col.key === "past_due") {
                      return (
                        <td key={col.key} className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${(val as number) > 90 ? "bg-rose-500" : "bg-primary"}`}
                            />
                            <span
                              className={`tabular-nums font-bold tracking-tight ${(val as number) > 90 ? "text-rose-500" : "text-foreground"}`}
                            >
                              {val as number} DPD
                            </span>
                          </div>
                        </td>
                      );
                    }

                    if (col.key === "customer_grade") {
                      return (
                        <td key={col.key} className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded bg-muted  font-mono text-[9px] font-bold border border-border text-muted-foreground">
                            {val as string}
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={col.key}
                        className="py-4 px-4 text-foreground/80 font-medium tracking-wide tabular-nums transition-colors"
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                <td className="py-4 px-4 text-center transition-colors">
                  <RowActionMenu 
                    entry={entry} 
                    onAction={onCallSiteVisit}
                    onTrackSiteVisit={onTrackSiteVisit} 
                    onView={(e) => setViewData(e)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Premium Empty State — shown when no data */}
      {paginatedData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-8 gap-4">
          <div className="w-20 h-20 rounded-3xl bg-muted/60 border border-border/60 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-4xl text-muted-foreground/40">manage_search</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground/70 uppercase tracking-widest mb-1">No Records Found</p>
            <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
              No accounts match your current filters. Try adjusting your search criteria or clearing the active filters.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
            <span className="material-symbols-outlined text-[12px]">info</span>
            <span>Filters may be too restrictive</span>
          </div>
        </div>
      )}

      <div className="px-8 py-4 flex justify-between items-center bg-background border-t border-border  shrink-0">
        <div className="flex items-center gap-3">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em]">
            Records{" "}
            <span className="text-foreground">
              {(currentPage - 1) * rowsPerPage + 1}-
              {Math.min(currentPage * rowsPerPage, data.length)}
            </span>{" "}
            of{" "}
            <span className="text-foreground">
              {data.length}
            </span>
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border  bg-card  text-muted-foreground transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-lg">
              chevron_left
            </span>
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                currentPage === i + 1
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/30"
                  : "bg-card  border border-border  text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border  bg-card  text-muted-foreground transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-lg">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <ViewCollectionModal 
        isOpen={!!viewData} 
        onClose={() => setViewData(null)} 
        entry={viewData}
        onTrackSiteVisit={onTrackSiteVisit}
        onViewSiteVisit={onViewSiteVisit}
      />
    </div>
  );
}

function PageButton({
  icon,
  label,
  active = false,
  disabled = false,
}: {
  icon?: string;
  label?: string;
  active?: boolean;
  disabled?: boolean;
}) {
  if (active) {
    return (
      <button className="text-[10px] font-bold text-primary border-b-2 border-primary pb-0.5 tracking-widest">
        0{label}
      </button>
    );
  }
  return (
    <button
      disabled={disabled}
      className={`text-[10px] font-bold tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
        icon
          ? "text-muted-foreground p-1"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon ? (
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
      ) : (
        `0${label}`
      )}
    </button>
  );
}
