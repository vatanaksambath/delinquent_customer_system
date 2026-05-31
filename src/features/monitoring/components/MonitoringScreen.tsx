import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StatCard } from "@/features/dashboard/components/StatCard";
import LedgerTable, {
  ExportDropdown,
  FilterDropdown,
} from "@/features/accounts/components/LedgerTable";
import { SiteVisitDrawer } from "@/features/site-visits/components/SiteVisitDrawer";
import { SiteVisitHistoryDrawer } from "@/features/site-visits/components/SiteVisitHistoryDrawer";
import {
  SAMPLE_DATA,
  LedgerEntry,
  MONITORING_COLUMNS,
  DEFAULT_VISIBLE_MONITORING,
} from "@/types";

export default function MonitoringScreen({
  preloadData,
  onPreloadProcessed,
  onAccountSelect,
}: {
  preloadData?: any;
  onPreloadProcessed?: () => void;
  onAccountSelect?: (data: any) => void;
}) {
  // Local Screen State
  const [data, setData] = useState<LedgerEntry[]>(SAMPLE_DATA);
  const [visibleColumns, setVisibleColumns] = useState<(keyof LedgerEntry)[]>(
    DEFAULT_VISIBLE_MONITORING,
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [filterDpd, setFilterDpd] = useState<string>("all");
  const [filterBalance, setFilterBalance] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [globalSearch, setGlobalSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LedgerEntry | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const [currentView, setCurrentView] = useState<"table" | "add">("table");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (preloadData) {
      setCurrentView("add");
      onPreloadProcessed?.();
    }
  }, [preloadData, onPreloadProcessed]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filteredData = useMemo(() => {
    let result = [...data];

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

    // Filter by DPD
    if (filterDpd === "90+") {
      result = result.filter((curr) => curr.past_due > 90);
    } else if (filterDpd === "30-90") {
      result = result.filter(
        (curr) => curr.past_due >= 30 && curr.past_due <= 90,
      );
    } else if (filterDpd === "<30") {
      result = result.filter((curr) => curr.past_due < 30);
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
  }, [data, filterDpd, filterBalance, filterGrade, globalSearch, sortConfig]);

  const handleSort = (key: keyof LedgerEntry) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleAddEntry = (newEntry: Partial<LedgerEntry>) => {
    const entry: LedgerEntry = {
      ...SAMPLE_DATA[0], // Use a sample for boilerplate defaults
      ...newEntry,
      account_number:
        newEntry.account_number ||
        `AC-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900) + 100}`,
      cid: newEntry.cid || `CID-${Math.floor(Math.random() * 90000) + 10000}`,
      past_due: 0,
      usd_equivalent: 0,
      customer_grade: "A",
    } as LedgerEntry;

    setData([entry, ...data]);
    setCurrentView("table");
    setToast("Collection transaction created successfully");
  };

  const Breadcrumbs = () => {
    if (currentView === "table") return null;

    return (
      <nav className="flex items-center gap-4 mb-6 shrink-0">
        <button
          onClick={() => setCurrentView("table")}
          className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all cursor-pointer"
        >
          <span className="text-[10px] font-mono font-black border border-border rounded px-1.5 py-0.5 group-hover:border-primary group-hover:bg-primary/5">
            01
          </span>
          <span className="text-sm font-black uppercase tracking-[0.2em] border-b-2 border-primary/40 group-hover:border-primary group-hover:scale-105 transition-all">
            Collection
          </span>
        </button>

        <span className="text-muted-foreground/30 font-mono text-xs">
          / /
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-black border border-primary/20 bg-primary/5 text-primary rounded px-1.5 py-0.5">
            02
          </span>
          <span className="text-sm font-black uppercase tracking-[0.2em] text-primary">
            New Collection Account
          </span>
        </div>

        <div className="flex-1 h-[1px] bg-gradient-to-r from-outline/20 to-transparent ml-4"></div>
      </nav>
    );
  };

  return (
    <motion.div
      key="monitoring"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full overflow-hidden relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="absolute top-4 left-1/2 z-[100] px-6 py-3 bg-on-surface text-surface rounded-xl shadow-2xl flex items-center gap-3 border border-border "
          >
            <span className="material-symbols-outlined text-primary">
              check_circle
            </span>
            <p className="text-[11px] font-bold uppercase tracking-widest">
              {toast}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-8 mt-1">
        <Breadcrumbs />
      </div>

      <AnimatePresence mode="wait">
        {currentView === "table" ? (
          <motion.div
            key="table-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-4 flex-1 min-h-0 px-8"
          >
            <div className="flex justify-between items-end border-b border-border  pb-3 shrink-0">
              <div>
                <p className="text-[9px] text-primary font-bold mb-0.5 uppercase tracking-[0.3em]">
                  Portfolio Surveillance
                </p>
                <h2 className="text-2xl font-headline font-bold text-foreground tracking-tight">
                  Collection
                </h2>
              </div>
              <div className="flex items-center gap-1.5 overflow-visible pb-1">
                {/* Operation Actions */}
                <button
                  onClick={() => setCurrentView("add")}
                  className="tech-button h-9 px-4 bg-primary text-on-primary text-[9px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:brightness-110 flex items-center gap-2 cursor-pointer shrink-0 rounded-lg"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                  Add New
                </button>

                <div className="w-[1px] h-4 bg-outline/30 mx-1 shrink-0"></div>

                {/* Table Control Actions */}
                <button
                  onClick={() => {
                    setFilterDpd("all");
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
                  <span className="material-symbols-outlined text-[18px]">
                    tune
                  </span>
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

            <div className="shrink-0">
              {/* Filter Bar above cards */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-visible pb-4"
                  >
                    <div className="flex flex-wrap gap-3 p-2 bg-card  border border-border  rounded-xl shadow-sm">
                      {/* DPD Filter */}
                      <FilterDropdown
                        icon="filter_list"
                        value={filterDpd}
                        onChange={(val) => {
                          setFilterDpd(val);
                          setCurrentPage(1);
                        }}
                        options={[
                          { value: "all", label: "ALL STATUS" },
                          { value: "90+", label: "OVERDUE 90+" },
                          { value: "30-90", label: "OVERDUE 30-90" },
                          { value: "<30", label: "UNDER 30 DPD" },
                        ]}
                      />

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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
                <StatCard title="Review Workload" value="78%" trend="+4.1%" />
                <StatCard
                  variant="wide"
                  title="Detection Speed"
                  value="2.4 Hours"
                  subValue="Avg. Trigger Response"
                />
                <StatCard
                  variant="error"
                  title="Watchlist Exposure"
                  value="$8.2M"
                  subValue="High Probability NPL"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <LedgerTable
                data={filteredData}
                columns={MONITORING_COLUMNS}
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
                onCallSiteVisit={onAccountSelect}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="add-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-hidden"
          >
            <AddMonitoringPage
              onCancel={() => setCurrentView("table")}
              onAdd={handleAddEntry}
              initialData={preloadData}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Component: AddMonitoringPage ---
const AddMonitoringPage = ({
  onCancel,
  onAdd,
  initialData,
}: {
  onCancel: () => void;
  onAdd: (data: Partial<LedgerEntry>) => void;
  initialData?: any;
}) => {
  // Site Visit Flow State
  const [isSiteVisitDrawerOpen, setIsSiteVisitDrawerOpen] = useState(false);
  const [isSiteVisitHistoryOpen, setIsSiteVisitHistoryOpen] = useState(false);
  const [siteVisitData, setSiteVisitData] = useState<any>(null);

  const [formData, setFormData] = useState<Partial<LedgerEntry>>({
    branch_name: initialData?.branch_code || initialData?.BRANCH_CODE || "",
    division: initialData?.division || "",
    department: initialData?.department || "",
    lro_name:
      initialData?.loan_officer ||
      initialData?.LOAN_OFFICER ||
      initialData?.LRO_NAME ||
      "",
    cid: initialData?.cid || initialData?.CID || "",
    customer_name:
      initialData?.customer_name || initialData?.["Customer Name"] || "",
    industry_type: "Retail",
    business_type: initialData?.BUSS_TYPE || "Sole Proprietorship",
    phone_number: initialData?.phone_number || "",
    account_number:
      initialData?.account_number || initialData?.["Accoun Num"] || "",
    reason_loan_default:
      initialData?.root_cause ||
      initialData?.["ROUT COURSE OF LOAN DEFAULT"] ||
      "Business Failure",
    legal_action:
      initialData?.legal_action ||
      initialData?.["LEGAL ACTION"] ||
      "Non Legal Case",
    date_approval_legal: "",
    legal_stage: "",
    remark_legal: "",
    date_of_contact: new Date().toISOString().split("T")[0],
    channel_contact: "Phone Call",
    status_call_visit: "Meet",
    // Scenario A: NOT MEET
    not_meet_next_action: "",
    not_meet_date: "",
    not_meet_remark: "",
    not_meet_call_log: "No",
    not_meet_issue_letter: "No",
    not_meet_delivery_channel: "",
    not_meet_date_delivery: "",
    not_meet_recovery_report: "No",
    // Scenario B: MEET
    meet_possible_solution: "",
    meet_specific_resolution: "",
    meet_solution_status: "",
    meet_expected_date: "",
    meet_remark: "",
    meet_call_log: "No",
    meet_issue_letter: "No",
    meet_delivery_channel: "",
    meet_date_delivery: "",
    meet_recovery_report: "No",
    meet_none_solution: "",
    meet_action_progress: "",
    meet_date_submit: "",
    meet_none_remark: "",
    // Shared / Files
    call_log_file: null,
    issue_letter_file: null,
    recovery_report_file: null,
    not_meet_call_log_file: null,
    not_meet_issue_letter_file: null,
    not_meet_recovery_report_file: null,
    // Storing preloaded amounts for the table display
    usd_equivalent:
      initialData?.usd_equivalent ||
      (typeof initialData?.USD_Equivalent === "string"
        ? parseFloat(initialData.USD_Equivalent.replace(/,/g, ""))
        : initialData?.USD_Equivalent) ||
      0,
    credit_limit:
      initialData?.credit_limit ||
      (typeof initialData?.CREDIT_LIMIT === "string"
        ? parseFloat(initialData.CREDIT_LIMIT.replace(/,/g, ""))
        : initialData?.CREDIT_LIMIT) ||
      0,
    pro_rate:
      typeof initialData?.pro_rate === "number"
        ? initialData?.pro_rate
        : parseFloat(String(initialData?.PRO_RATE)) || 0,
    currency: initialData?.currency || initialData?.CURRENCY || "USD",
  });

  const handleChange = (field: keyof LedgerEntry, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "channel_contact" && value !== "Site Visit") {
      setSiteVisitData(null);
    }
  };

  useEffect(() => {
    if (formData.channel_contact === "Site Visit" && !siteVisitData) {
      setIsSiteVisitDrawerOpen(true);
    }
  }, [formData.channel_contact, siteVisitData]);

  const RequiredAsterisk = () => (
    <span className="text-red-500 ml-1 select-none">*</span>
  );

  const InputField = ({
    label,
    value,
    onChange,
    placeholder,
    required = false,
    type = "text",
  }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 ml-1 flex items-center">
        {label}
        {required && <RequiredAsterisk />}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 py-2 bg-card  border border-border  rounded-lg text-[11px] font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
      />
    </div>
  );

  const SelectField = ({
    label,
    value,
    onChange,
    options,
    required = false,
  }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 ml-1 flex items-center">
        {label}
        {required && <RequiredAsterisk />}
      </label>
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 pl-3 pr-10 py-2 bg-card  border border-border  rounded-lg text-[11px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all appearance-none cursor-pointer shadow-sm group-hover:border-primary/30"
        >
          {options.map((opt: string) => (
            <option
              key={opt}
              value={opt}
              className="bg-card  text-foreground"
            >
              {opt}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary pointer-events-none text-[18px]">
          expand_more
        </span>
      </div>
    </div>
  );

  const ToggleField = ({ label, value, onChange, required = false }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 ml-1 flex items-center">
        {label}
        {required && <RequiredAsterisk />}
      </label>
      <div className="flex w-full p-1 bg-card  border border-border  rounded-lg shadow-sm h-10">
        <button
          onClick={() => onChange("Meet")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
            value === "Meet"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-primary/5"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">groups</span>
          Meet
        </button>
        <button
          onClick={() => onChange("Not Meet")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
            value === "Not Meet"
              ? "bg-accent text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-accent/5"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            person_off
          </span>
          Not Meet
        </button>
      </div>
    </div>
  );

  const YesNoToggle = ({ label, value, onChange, required = false }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 ml-1 flex items-center">
        {label}
        {required && <RequiredAsterisk />}
      </label>
      <div className="flex w-full p-1 bg-card  border border-border  rounded-lg shadow-sm h-10">
        <button
          onClick={() => onChange("Yes")}
          className={`flex-1 flex items-center justify-center rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
            value === "Yes"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-primary/5"
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange("No")}
          className={`flex-1 flex items-center justify-center rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
            value === "No"
              ? "bg-accent text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-accent/5"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );

  const FileBrowse = ({ label, fileName, onFileSelect }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 ml-1">
        {label}
      </label>
      <div className="relative h-10">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="w-full h-full px-3 flex items-center justify-between bg-card  border border-border  border-dashed rounded-lg text-[10px] font-bold text-muted-foreground group-hover:border-primary/40 transition-all">
          <span className="truncate max-w-[150px]">
            {fileName || "SELECT PDF DOCUMENT"}
          </span>
          <span className="material-symbols-outlined text-[18px] text-primary">
            upload_file
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-card  overflow-hidden font-headline">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="w-full px-8 py-10 space-y-10 pb-10">
          {/* Section 1: Digital Entity Identification */}
          <section className="modern-card p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border  pb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-primary/30 rounded-full"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">
                  Digital Entity Identification
                </h3>
              </div>
              <div className="flex gap-1.5 opacity-30">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <div className="w-2 h-2 rounded-full bg-outline"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <InputField
                label="Branch Name"
                value={formData.branch_name}
                onChange={(v: string) => handleChange("branch_name", v)}
                required
                placeholder="e.g. BR-101"
              />
              <InputField
                label="Division"
                value={formData.division}
                onChange={(v: string) => handleChange("division", v)}
                placeholder="e.g. Corporate"
              />
              <InputField
                label="Department"
                value={formData.department}
                onChange={(v: string) => handleChange("department", v)}
                placeholder="e.g. Risk Management"
              />
              <InputField
                label="LRO Name"
                value={formData.lro_name}
                onChange={(v: string) => handleChange("lro_name", v)}
                required
                placeholder="e.g. J. Sterling"
              />
              <InputField
                label="CID"
                value={formData.cid}
                onChange={(v: string) => handleChange("cid", v)}
                required
                placeholder="Enter CID number"
              />
              <InputField
                label="Customer Name"
                value={formData.customer_name}
                onChange={(v: string) => handleChange("customer_name", v)}
                required
                placeholder="Legal entity or full individual name"
              />
              <SelectField
                label="Industry Type"
                value={formData.industry_type}
                onChange={(v: string) => handleChange("industry_type", v)}
                options={[
                  "Retail",
                  "Manufacturing",
                  "Technology",
                  "Service",
                  "Agriculture",
                ]}
              />
              <SelectField
                label="Business Type"
                value={formData.business_type}
                onChange={(v: string) => handleChange("business_type", v)}
                options={[
                  "Sole Proprietorship",
                  "Partnership",
                  "Corporate Entity",
                  "Non-Profit",
                  "Government",
                ]}
              />
            </div>
          </section>

          {/* Section 1.5: Loan Information */}
          <section className="modern-card p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border  pb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-secondary/30 rounded-full"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">
                  Loan Information
                </h3>
              </div>
              <div className="flex gap-1.5 opacity-30">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <div className="w-2 h-2 rounded-full bg-outline"></div>
                <div className="w-2 h-2 rounded-full bg-primary/10"></div>
              </div>
            </div>

            <div className="overflow-x-auto border border-border  rounded-xl bg-card ">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card  border-b border-border ">
                    <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      Account Number
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      Disburse Amount
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      Disburse Currency
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      Disburse Amount In USD
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap text-center">
                      Interest Rate
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      OS Amount
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      OS Currency
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10 text-foreground">
                  <tr className="hover:bg-primary/5 transition-colors group">
                    <td className="px-4 py-4 text-[11px] font-semibold font-mono text-primary">
                      {formData.account_number}
                    </td>
                    <td className="px-4 py-4 text-[11px] font-medium">
                      {formData.credit_limit?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-[11px] font-medium opacity-70">
                      {formData.currency}
                    </td>
                    <td className="px-4 py-4 text-[11px] font-medium">
                      {formData.usd_equivalent?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-[11px] font-medium text-center">
                      {formData.pro_rate}%
                    </td>
                    <td className="px-4 py-4 text-[11px] font-bold text-accent">
                      {formData.usd_equivalent?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-[11px] font-medium opacity-70">
                      {formData.currency}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button className="w-8 h-8 flex items-center justify-center text-error/60 lg:opacity-0 lg:group-hover:opacity-100 hover:text-error hover:bg-error/10 rounded-lg transition-all mx-auto">
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 pt-4 border-t border-border">
              <SelectField
                label="Reason of Loan Default"
                value={formData.reason_loan_default}
                onChange={(v: string) => handleChange("reason_loan_default", v)}
                options={[
                  "Business Failure",
                  "Market Volatility",
                  "Personal Exigency",
                  "Medical Issues",
                  "Property Damage",
                ]}
              />
              <SelectField
                label="Legal Action"
                value={formData.legal_action}
                onChange={(v: string) => handleChange("legal_action", v)}
                options={[
                  "Non Legal Case",
                  "Mediation Pending",
                  "Litigation Initiated",
                  "Asset Seizure",
                ]}
              />
              <SelectField
                label="Date of Approval (Legal Action)"
                value={formData.date_approval_legal}
                onChange={(v: string) => handleChange("date_approval_legal", v)}
                options={[
                  "Select Date",
                  "2024-Q1",
                  "2024-Q2",
                  "2024-Q3",
                  "2024-Q4",
                ]}
              />
              <SelectField
                label="Legal Stage"
                value={formData.legal_stage}
                onChange={(v: string) => handleChange("legal_stage", v)}
                options={[
                  "Not Started",
                  "Information Gathering",
                  "Notice Issued",
                  "Court Filing",
                  "Judgment",
                  "Execution",
                ]}
              />
              <div className="col-span-1 md:col-span-2">
                <InputField
                  label="Remark (if any comment)"
                  value={formData.remark_legal}
                  onChange={(v: string) => handleChange("remark_legal", v)}
                  placeholder="Additional context about the legal status..."
                />
              </div>
            </div>
          </section>

          {/* Section 1.7: Call/Visit Status */}
          <section className="modern-card p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border  pb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-primary/40 rounded-full"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-4">
                  Call/Visit Status
                  {initialData && (
                    <button
                      type="button"
                      onClick={() => setIsSiteVisitHistoryOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground  hover:bg-accent hover:text-accent-foreground rounded-full font-bold uppercase tracking-widest text-[9px] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        history
                      </span>
                      View Site Visit History (3)
                    </button>
                  )}
                </h3>
              </div>
              <div className="flex gap-1.5 opacity-30">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <div className="w-2 h-2 rounded-full bg-outline"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <InputField
                label="Date of Contact"
                type="date"
                value={formData.date_of_contact}
                onChange={(v: string) => handleChange("date_of_contact", v)}
                required
              />
              <div>
                <SelectField
                  label="Channel of Last Contact"
                  value={formData.channel_contact}
                  onChange={(v: string) => handleChange("channel_contact", v)}
                  options={[
                    "Phone Call",
                    "Site Visit",
                    "Office Meeting",
                    "Email/Letter",
                    "Third Party Messenger",
                  ]}
                />
                {formData.channel_contact === "Site Visit" && (
                  <button
                    type="button"
                    onClick={() => setIsSiteVisitDrawerOpen(true)}
                    className="mt-2 w-full px-4 py-2 bg-muted border border-indigo-200  text-indigo-600  text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 hover:bg-accent  transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      edit_document
                    </span>
                    {siteVisitData
                      ? "Edit Site Visit Report"
                      : "Complete Site Visit Report"}
                  </button>
                )}
              </div>
              <ToggleField
                label="Status of Call/Visit"
                value={formData.status_call_visit}
                onChange={(v: string) => handleChange("status_call_visit", v)}
                required
              />
            </div>
          </section>

          {/* Conditional Section: If Meet */}
          {formData.status_call_visit === "Meet" && (
            <section className="modern-card p-6 flex flex-col gap-6 bg-primary/[0.02]">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]"></div>
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">
                    Meet Protocol / Resolution Pathway
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                    Active Scenario
                  </span>
                  <div className="flex gap-1.5 opacity-30">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 pt-4 border-t border-border">
                <SelectField
                  label="Possible Solution"
                  value={formData.meet_possible_solution}
                  onChange={(v: string) =>
                    handleChange("meet_possible_solution", v)
                  }
                  options={[
                    "Full Settlement",
                    "Partial Settlement",
                    "Restructuring",
                    "Grace Period Extension",
                    "Asset Liquidation",
                  ]}
                />
                <SelectField
                  label="Specific Resolution"
                  value={formData.meet_specific_resolution}
                  onChange={(v: string) =>
                    handleChange("meet_specific_resolution", v)
                  }
                  options={[
                    "Installment Plan Agreement",
                    "Interest Rate Reduction",
                    "Collateral Swap",
                    "Third-Party Buyout",
                  ]}
                />
                <SelectField
                  label="Solution Status"
                  value={formData.meet_solution_status}
                  onChange={(v: string) =>
                    handleChange("meet_solution_status", v)
                  }
                  options={[
                    "Negotiation",
                    "Pending Documentation",
                    "Sent for Approval",
                    "Signed/Executed",
                    "Implementation",
                  ]}
                />
                <InputField
                  label="Expected Date"
                  type="date"
                  value={formData.meet_expected_date}
                  onChange={(v: string) =>
                    handleChange("meet_expected_date", v)
                  }
                />
                <div className="col-span-1 md:col-span-2">
                  <InputField
                    label="Remark (if any comment)"
                    value={formData.meet_remark}
                    onChange={(v: string) => handleChange("meet_remark", v)}
                    placeholder="Describe the agreed terms and resolution details..."
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <YesNoToggle
                    label="Call Log Report"
                    value={formData.meet_call_log}
                    onChange={(v: string) => handleChange("meet_call_log", v)}
                  />
                  {formData.meet_call_log === "Yes" && (
                    <FileBrowse
                      label="Upload Report"
                      fileName={
                        formData.call_log_file instanceof File
                          ? formData.call_log_file.name
                          : (formData.call_log_file as string)
                      }
                      onFileSelect={(file: File) =>
                        setFormData(
                          (prev) =>
                            ({
                              ...prev,
                              call_log_file: file,
                            }) as Partial<LedgerEntry>,
                        )
                      }
                    />
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <YesNoToggle
                    label="Issue Letter"
                    value={formData.meet_issue_letter}
                    onChange={(v: string) =>
                      handleChange("meet_issue_letter", v)
                    }
                  />
                  {formData.meet_issue_letter === "Yes" && (
                    <FileBrowse
                      label="Upload Letter"
                      fileName={
                        formData.issue_letter_file instanceof File
                          ? formData.issue_letter_file.name
                          : (formData.issue_letter_file as string)
                      }
                      onFileSelect={(file: File) =>
                        setFormData(
                          (prev) =>
                            ({
                              ...prev,
                              issue_letter_file: file,
                            }) as Partial<LedgerEntry>,
                        )
                      }
                    />
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <YesNoToggle
                    label="Recovery Report"
                    value={formData.meet_recovery_report}
                    onChange={(v: string) =>
                      handleChange("meet_recovery_report", v)
                    }
                  />
                  {formData.meet_recovery_report === "Yes" && (
                    <FileBrowse
                      label="Upload Recovery Doc"
                      fileName={
                        formData.recovery_report_file instanceof File
                          ? formData.recovery_report_file.name
                          : (formData.recovery_report_file as string)
                      }
                      onFileSelect={(file: File) =>
                        setFormData(
                          (prev) =>
                            ({
                              ...prev,
                              recovery_report_file: file,
                            }) as Partial<LedgerEntry>,
                        )
                      }
                    />
                  )}
                </div>

                <SelectField
                  label="Delivery Letter Channel"
                  value={formData.meet_delivery_channel}
                  onChange={(v: string) =>
                    handleChange("meet_delivery_channel", v)
                  }
                  options={[
                    "Hand Delivery",
                    "Registered Post",
                    "Courier Service",
                    "Digital Portal",
                    "Email Confirmation",
                  ]}
                />
                <InputField
                  label="Date to Delivery"
                  type="date"
                  value={formData.meet_date_delivery}
                  onChange={(v: string) =>
                    handleChange("meet_date_delivery", v)
                  }
                />
                <SelectField
                  label="None Solution"
                  value={formData.meet_none_solution}
                  onChange={(v: string) =>
                    handleChange("meet_none_solution", v)
                  }
                  options={[
                    "Legal Escalation",
                    "Account Suspension",
                    "Write-off Investigation",
                    "Collateral Possession",
                  ]}
                />

                <SelectField
                  label="Action Progress"
                  value={formData.meet_action_progress}
                  onChange={(v: string) =>
                    handleChange("meet_action_progress", v)
                  }
                  options={[
                    "0% Initiated",
                    "25% Evidence Building",
                    "50% Internal Audit",
                    "75% Approval Stage",
                    "100% Resolved",
                  ]}
                />
                <InputField
                  label="Date of Submit"
                  type="date"
                  value={formData.meet_date_submit}
                  onChange={(v: string) => handleChange("meet_date_submit", v)}
                />
                <div></div>

                <div className="col-span-1 md:col-span-3">
                  <InputField
                    label="Remark (if any comment)"
                    value={formData.meet_none_remark}
                    onChange={(v: string) =>
                      handleChange("meet_none_remark", v)
                    }
                    placeholder="Final assessment and strategic notes..."
                  />
                </div>
              </div>
            </section>
          )}

          {/* Conditional Section: If Not Meet */}
          {formData.status_call_visit === "Not Meet" && (
            <section className="modern-card p-6 flex flex-col gap-6 bg-accent/[0.02]">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-accent rounded-full shadow-[0_0_8px_rgba(var(--accent),0.4)]"></div>
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">
                    Not Meet Protocol / Escalation Pathway
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-[9px] font-black uppercase tracking-widest">
                    Active Scenario
                  </span>
                  <div className="flex gap-1.5 opacity-30">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <div className="w-2 h-2 rounded-full bg-accent/60"></div>
                    <div className="w-2 h-2 rounded-full bg-accent/30"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 pt-4 border-t border-border">
                <SelectField
                  label="Next Action Type"
                  value={formData.not_meet_next_action}
                  onChange={(v: string) =>
                    handleChange("not_meet_next_action", v)
                  }
                  options={[
                    "Follow-up Call",
                    "Second Site Visit",
                    "Third-Party Verification",
                    "Legal Demand Letter",
                    "Enforcement Inquiry",
                  ]}
                />
                <InputField
                  label="Next Action Date"
                  type="date"
                  value={formData.not_meet_date}
                  onChange={(v: string) => handleChange("not_meet_date", v)}
                />
                <div></div>

                <div className="col-span-1 md:col-span-3">
                  <InputField
                    label="Remark (if any comment)"
                    value={formData.not_meet_remark}
                    onChange={(v: string) => handleChange("not_meet_remark", v)}
                    placeholder="Provide details on why meeting failed and planned next steps..."
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <YesNoToggle
                    label="Call Log Report"
                    value={formData.not_meet_call_log}
                    onChange={(v: string) =>
                      handleChange("not_meet_call_log", v)
                    }
                  />
                  {formData.not_meet_call_log === "Yes" && (
                    <FileBrowse
                      label="Upload Report"
                      fileName={
                        formData.not_meet_call_log_file instanceof File
                          ? formData.not_meet_call_log_file.name
                          : (formData.not_meet_call_log_file as string)
                      }
                      onFileSelect={(file: File) =>
                        setFormData(
                          (prev) =>
                            ({
                              ...prev,
                              not_meet_call_log_file: file,
                            }) as Partial<LedgerEntry>,
                        )
                      }
                    />
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <YesNoToggle
                    label="Issue Letter"
                    value={formData.not_meet_issue_letter}
                    onChange={(v: string) =>
                      handleChange("not_meet_issue_letter", v)
                    }
                  />
                  {formData.not_meet_issue_letter === "Yes" && (
                    <FileBrowse
                      label="Upload Letter"
                      fileName={
                        formData.not_meet_issue_letter_file instanceof File
                          ? formData.not_meet_issue_letter_file.name
                          : (formData.not_meet_issue_letter_file as string)
                      }
                      onFileSelect={(file: File) =>
                        setFormData(
                          (prev) =>
                            ({
                              ...prev,
                              not_meet_issue_letter_file: file,
                            }) as Partial<LedgerEntry>,
                        )
                      }
                    />
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <YesNoToggle
                    label="Recovery Report"
                    value={formData.not_meet_recovery_report}
                    onChange={(v: string) =>
                      handleChange("not_meet_recovery_report", v)
                    }
                  />
                  {formData.not_meet_recovery_report === "Yes" && (
                    <FileBrowse
                      label="Upload Recovery Doc"
                      fileName={
                        formData.not_meet_recovery_report_file instanceof File
                          ? formData.not_meet_recovery_report_file.name
                          : (formData.not_meet_recovery_report_file as string)
                      }
                      onFileSelect={(file: File) =>
                        setFormData(
                          (prev) =>
                            ({
                              ...prev,
                              not_meet_recovery_report_file: file,
                            }) as Partial<LedgerEntry>,
                        )
                      }
                    />
                  )}
                </div>

                <SelectField
                  label="Delivery Letter Channel"
                  value={formData.not_meet_delivery_channel}
                  onChange={(v: string) =>
                    handleChange("not_meet_delivery_channel", v)
                  }
                  options={[
                    "Registered Post",
                    "Courier Service",
                    "Digital Portal",
                    "Email Confirmation",
                    "Public Notice",
                  ]}
                />
                <InputField
                  label="Date to Delivery"
                  type="date"
                  value={formData.not_meet_date_delivery}
                  onChange={(v: string) =>
                    handleChange("not_meet_date_delivery", v)
                  }
                />
                <div></div>
              </div>
            </section>
          )}

          {/* Footer Info */}
          <div className="pt-8 flex items-center justify-center text-muted-foreground opacity-30 text-[10px] gap-6 uppercase font-black tracking-[0.4em]">
            <div className="h-px bg-outline/20 flex-1"></div>
            <div className="h-px bg-outline/20 flex-1"></div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="px-8 py-5 bg-card  border-t border-border  flex justify-end items-center gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-20">
        <button
          onClick={onCancel}
          className="h-11 px-8 rounded-xl border border-border  bg-card  hover:bg-error/5 hover:border-error/40 text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-3 transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
          Discard
        </button>
        <button
          onClick={() => onAdd(formData)}
          disabled={formData.channel_contact === "Site Visit" && !siteVisitData}
          className={`h-11 px-8 rounded-xl ${formData.channel_contact === "Site Visit" && !siteVisitData ? "bg-slate-300 text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 cursor-pointer"} text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all`}
        >
          {formData.channel_contact === "Site Visit" && !siteVisitData ? (
            <>
              <span className="material-symbols-outlined text-[20px]">
                lock
              </span>
              Locked
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">
                save
              </span>
              Save
            </>
          )}
        </button>
      </footer>

      {/* Site Visit Interceptor Drawer */}
      <SiteVisitDrawer
        isOpen={isSiteVisitDrawerOpen}
        onClose={() => {
          setIsSiteVisitDrawerOpen(false);
          // Revert selection if canceled without saving
          if (!siteVisitData && formData.channel_contact === "Site Visit") {
            handleChange("channel_contact", "Phone Call");
          }
        }}
        onSave={(data) => {
          setSiteVisitData(data);
          setIsSiteVisitDrawerOpen(false);
        }}
        account={{
          cid: formData.cid || "N/A",
          customerName: formData.customer_name || "N/A",
          totalBalance: formData.usd_equivalent || 0,
          dpd: typeof formData.past_due === "number" ? formData.past_due : 0,
        }}
        currentUser={formData.lro_name || "Agent"}
        initialData={siteVisitData}
      />

      {/* Site Visit History Drawer */}
      <SiteVisitHistoryDrawer
        isOpen={isSiteVisitHistoryOpen}
        onClose={() => setIsSiteVisitHistoryOpen(false)}
        customerName={formData.customer_name || "N/A"}
        cid={formData.cid || "N/A"}
      />
    </div>
  );
};
