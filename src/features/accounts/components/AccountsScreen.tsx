import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StatCard } from "@/features/dashboard/components/StatCard";
import LedgerTable, {
  ExportDropdown,
  FilterDropdown,
} from "@/features/accounts/components/LedgerTable";
import {
  SAMPLE_DATA,
  LedgerEntry,
  ALL_COLUMNS,
  DEFAULT_VISIBLE,
} from "@/types";

export default function AccountsScreen({
  onCallSiteVisit,
}: {
  onCallSiteVisit?: (data: any) => void;
}) {
  // Local Screen State
  const [visibleColumns, setVisibleColumns] =
    useState<(keyof LedgerEntry)[]>(DEFAULT_VISIBLE);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "All" | "Grace Period" | "Early-Stage" | "Mid-Stage" | "Late-Stage"
  >("All");
  const [filterBalance, setFilterBalance] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [globalSearch, setGlobalSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LedgerEntry | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const filteredData = useMemo(() => {
    let result = [...SAMPLE_DATA];

    // Global Search
    if (globalSearch) {
      const search = globalSearch.toLowerCase();
      result = result.filter(
        (curr) =>
          curr.account_number.toLowerCase().includes(search) ||
          curr.cid.toLowerCase().includes(search) ||
          curr.customer_name.toLowerCase().includes(search),
      );
    }

    // Filter by Bucket/Stage
    if (activeTab === "Grace Period") {
      result = result.filter(
        (curr) => curr.past_due > 0 && curr.past_due <= 14,
      );
    } else if (activeTab === "Early-Stage") {
      result = result.filter(
        (curr) => curr.past_due >= 15 && curr.past_due <= 30,
      );
    } else if (activeTab === "Mid-Stage") {
      result = result.filter(
        (curr) => curr.past_due >= 31 && curr.past_due <= 90,
      );
    } else if (activeTab === "Late-Stage") {
      result = result.filter((curr) => curr.past_due > 90);
    }

    // Filter by Balance
    if (filterBalance === "high") {
      result = result.filter((curr) => curr.usd_equivalent > 100000);
    } else if (filterBalance === "low") {
      result = result.filter((curr) => curr.usd_equivalent <= 100000);
    }

    // Filter by Grade
    if (filterGrade !== "all") {
      result = result.filter((curr) =>
        curr.customer_grade.startsWith(filterGrade),
      );
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [activeTab, filterBalance, filterGrade, globalSearch, sortConfig]);

  const handleSort = (key: keyof LedgerEntry) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <motion.div
      key="accounts"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-4 h-full overflow-hidden px-8"
    >
      <div className="flex justify-between items-end pb-1 mt-6 shrink-0">
        <div>
          <p className="text-[9px] text-primary font-bold mb-0.5 uppercase tracking-[0.3em]">
            Recovery Management
          </p>
          <h2 className="text-2xl font-headline font-bold text-foreground tracking-tight">
            PAR Accounts
          </h2>
        </div>
        <div className="flex items-center gap-1.5 overflow-visible pb-1">
          {/* Table Control Actions */}
          <button
            onClick={() => {
              setActiveTab("All");
              setFilterBalance("all");
              setFilterGrade("all");
              setGlobalSearch("");
              setCurrentPage(1);
            }}
            title="Refresh"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border  bg-card  text-muted-foreground hover:text-primary shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle Filters"
            className={`w-9 h-9 flex items-center justify-center rounded-lg border shrink-0 ${
              showFilters
                ? "bg-primary/10 border-primary text-primary"
                : "bg-card  border-border  text-muted-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>

          <ExportDropdown data={filteredData} />

          <button
            onClick={() => setShowColumnPicker(true)}
            className="h-9 flex items-center gap-2 px-3 bg-card  border border-border  text-muted-foreground hover:border-primary/40 hover:text-primary rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">
              view_column
            </span>
            Columns ({visibleColumns.length})
          </button>
        </div>
      </div>

      {/* Filter Bar above tabs */}
      <div className="shrink-0">
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-visible pb-4"
            >
              <div className="flex flex-wrap gap-3 p-2 bg-card  border border-border  rounded-xl shadow-sm">
                {/* Grade Filter */}
                <FilterDropdown
                  icon="grade"
                  value={filterGrade}
                  onChange={(val) => {
                    setFilterGrade(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "ALL GRADES" },
                    { value: "A", label: "GRADE A" },
                    { value: "B", label: "GRADE B" },
                    { value: "C", label: "GRADE C" },
                    { value: "D", label: "GRADE D" },
                  ]}
                />

                {/* Snapshot Date */}
                <div className="flex items-center gap-2 border border-border  rounded-lg px-2 py-1.5 bg-card  min-w-[160px] group hover:border-primary/40 transition-all shadow-sm cursor-pointer">
                  <span className="material-symbols-outlined text-[16px] text-muted-foreground">
                    calendar_today
                  </span>
                  <span className="flex-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground relative top-[0.5px]">
                    SELECT DATE
                  </span>
                </div>

                {/* Search / Run ID */}
                <div className="flex items-center gap-2 border border-border  rounded-lg px-2 py-1.5 bg-card  min-w-[180px] group focus-within:border-primary/40 transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-muted-foreground">
                    search
                  </span>
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => {
                      setGlobalSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="RUN ID SEARCH"
                    className="flex-1 bg-transparent border-none text-[9px] font-bold uppercase tracking-widest text-muted-foreground outline-none placeholder:text-muted-foreground/60 relative top-[0.5px]"
                  />
                </div>

                {/* Exposure / Scopes */}
                <FilterDropdown
                  icon="filter_alt"
                  value={filterBalance}
                  onChange={(val) => {
                    setFilterBalance(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "ALL SCOPES" },
                    { value: "high", label: "HIGH EXPOSURE" },
                    { value: "low", label: "LOW EXPOSURE" },
                  ]}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modern Tabs */}
      <div className="flex items-center gap-6 border-b border-border  px-2 shrink-0 pb-1">
        {(
          [
            "All",
            "Grace Period",
            "Early-Stage",
            "Mid-Stage",
            "Late-Stage",
          ] as const
        ).map((tab) => {
          const count = SAMPLE_DATA.filter((curr) => {
            if (tab === "All") return true;
            if (tab === "Grace Period")
              return curr.past_due > 0 && curr.past_due <= 14;
            if (tab === "Early-Stage")
              return curr.past_due >= 15 && curr.past_due <= 30;
            if (tab === "Mid-Stage")
              return curr.past_due >= 31 && curr.past_due <= 90;
            if (tab === "Late-Stage") return curr.past_due > 90;
            return false;
          }).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`relative pb-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "Grace Period" && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent text-primary-foreground"></span>
              )}
              {tab === "Early-Stage" && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500/100"></span>
              )}
              {tab === "Mid-Stage" && (
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500/100"></span>
              )}
              {tab === "Late-Stage" && (
                <span className="h-1.5 w-1.5 rounded-full bg-error text-primary-foreground"></span>
              )}
              {tab}
              <span
                className={`py-0.5 px-2 rounded-full text-[10px] leading-none ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
              >
                {count}
              </span>
              {isActive && (
                <motion.div
                  layoutId="accounts-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="shrink-0 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <StatCard
            title="Total Accounts"
            value={filteredData.length.toString()}
          />
          <StatCard
            title="Total Exposure"
            value={new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(
              filteredData.reduce((acc, curr) => acc + curr.usd_equivalent, 0),
            )}
          />
          <StatCard
            variant="error"
            title="Total Overdue"
            value={new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(
              filteredData.reduce((acc, curr) => acc + curr.ovrdue_pr, 0),
            )}
          />
          <StatCard
            title="Avg. Pro Rate"
            value={
              (filteredData.length
                ? filteredData.reduce((acc, curr) => acc + curr.pro_rate, 0) /
                  filteredData.length
                : 0
              ).toFixed(1) + "%"
            }
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <LedgerTable
          data={filteredData}
          columns={ALL_COLUMNS}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          showColumnPicker={showColumnPicker}
          setShowColumnPicker={setShowColumnPicker}
          filterBalance={filterBalance}
          setFilterBalance={setFilterBalance}
          filterGrade={filterGrade}
          setFilterGrade={setFilterGrade}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sortConfig={sortConfig}
          onSort={handleSort}
          onCallSiteVisit={onCallSiteVisit}
        />
      </div>
    </motion.div>
  );
}
