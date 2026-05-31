import React, { useState, useMemo, useRef, useEffect } from "react";
import { LedgerEntry, ALL_COLUMNS, DEFAULT_VISIBLE } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";

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
}: {
  entry: LedgerEntry;
  onAction?: (entry: LedgerEntry) => void;
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
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer ${
          isOpen
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-primary"
        }`}
      >
        <span className="material-symbols-outlined text-lg">more_vert</span>
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
              onClick={() => setIsOpen(false)}
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
        className="flex items-center gap-2 h-9 px-3 bg-primary hover:brightness-110 text-on-primary rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer whitespace-nowrap"
      >
        <span className="material-symbols-outlined text-[18px]">download</span>
        Export
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="material-symbols-outlined text-xs"
        >
          expand_more
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-2 w-48 bg-card  border border-border  rounded-xl shadow-2xl z-[150] overflow-hidden py-2"
          >
            <button
              onClick={() => handleExport("csv")}
              className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-primary/10 hover:text-primary transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg opacity-60">
                  csv
                </span>
                Export as CSV
              </div>
              <span className="material-symbols-outlined text-sm opacity-20">
                chevron_right
              </span>
            </button>
            <div className="mx-4 h-[1px] bg-outline/20"></div>
            <button
              onClick={() => handleExport("xlsx")}
              className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-primary/10 hover:text-primary transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg opacity-60">
                  table_chart
                </span>
                Export as XLSX
              </div>
              <span className="material-symbols-outlined text-sm opacity-20">
                chevron_right
              </span>
            </button>
            <div className="mx-4 h-[1px] bg-outline/20"></div>
            <button
              onClick={() => {
                window.focus();
                setIsOpen(false);
                setTimeout(() => {
                  window.print();
                }, 20);
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-primary/10 hover:text-primary transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg opacity-60">
                  print
                </span>
                Print Table
              </div>
              <span className="material-symbols-outlined text-sm opacity-20">
                chevron_right
              </span>
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
}: LedgerTableProps) {
  const [columnSearch, setColumnSearch] = useState("");
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
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 10, x: "-50%" }}
              style={{ left: "50%", top: "10%" }}
              className="fixed w-[90vw] max-w-3xl h-[75vh] bg-card  text-muted-foreground border border-border  rounded-lg shadow-2xl z-[101] overflow-hidden flex flex-col font-sans"
            >
              {/* Top Header */}
              <div className="px-6 py-4 bg-card  shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Customize Columns
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Select columns to display. Mandatory columns are locked.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowColumnPicker(false)}
                    className="text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      close
                    </span>
                  </button>
                </div>

                {/* Controls Bar */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="relative w-64">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-base">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder={`Search ${columns.length} columns...`}
                      value={columnSearch}
                      onChange={(e) => setColumnSearch(e.target.value)}
                      className="w-full bg-card  border border-border  rounded px-8 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <button
                      onClick={selectAll}
                      className="text-primary hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <div className="w-[1px] h-3 bg-outline"></div>
                    <button
                      onClick={deselectAll}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid content container */}
              <div className="flex-1 overflow-y-auto p-4 bg-card  border-t border-border ">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                  {filteredColumns.map((col) => {
                    const isMandatory = col.mandatory;
                    const isSelected = visibleColumns.includes(col.key);

                    return (
                      <label
                        key={col.key}
                        className={`flex items-center gap-0 rounded border transition-all h-[34px] overflow-hidden ${
                          isMandatory
                            ? "bg-muted border-border  cursor-not-allowed opacity-90"
                            : isSelected
                              ? "bg-primary/5 border-primary cursor-pointer"
                              : "bg-card  border-border  hover:border-slate-100  cursor-pointer shadow-sm"
                        }`}
                      >
                        {/* Icon Box */}
                        <div
                          className={`w-[34px] h-full flex items-center justify-center shrink-0 border-r ${
                            isMandatory
                              ? "bg-accent  border-border "
                              : isSelected
                                ? "bg-primary border-primary"
                                : "bg-card  border-border "
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isMandatory}
                            onChange={() => toggleColumn(col.key)}
                            className="peer hidden"
                          />
                          {isMandatory ? (
                            <span className="material-symbols-outlined text-[16px] text-muted-foreground">
                              lock
                            </span>
                          ) : isSelected ? (
                            <span className="material-symbols-outlined text-[16px] text-on-primary font-bold">
                              check
                            </span>
                          ) : (
                            <div className="w-4 h-4 rounded border border-border " />
                          )}
                        </div>
                        {/* Label */}
                        <div className="flex-1 px-3 truncate">
                          <span
                            className={`text-[11px] font-medium transition-colors ${
                              isMandatory
                                ? "text-muted-foreground"
                                : isSelected
                                  ? "text-primary"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {col.label}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 flex justify-between items-center bg-card  shrink-0 border-t border-border ">
                <div className="text-[11px] font-medium text-muted-foreground">
                  <span className="text-foreground font-bold">
                    {visibleColumns.length}
                  </span>{" "}
                  columns selected
                  <span className="mx-2 text-outline">|</span>
                  <span>{mandatoryKeys.length} Mandatory</span>
                </div>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setShowColumnPicker(false)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowColumnPicker(false)}
                    className="bg-primary text-on-primary text-xs font-semibold px-6 py-1.5 rounded hover:brightness-110 shadow-sm"
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
                  <RowActionMenu entry={entry} onAction={onCallSiteVisit} />
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
