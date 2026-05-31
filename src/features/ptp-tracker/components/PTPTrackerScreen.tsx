import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { ExportDropdown } from "@/features/accounts/components/LedgerTable";
import {
  Search,
  ChevronDown,
  Phone,
  AlertTriangle,
  Flag,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  CreditCard,
  MoreHorizontal,
  MessageSquare,
  History,
  PhoneCall,
  Filter,
} from "lucide-react";

type PTPStatus = "Pending" | "Kept" | "Broken";

interface PromiseToPay {
  id: string;
  customerName: string;
  accountNumber: string;
  amount: number;
  dueDate: string;
  status: PTPStatus;
  brokenCount: number;
  assignedAgent: string;
  phone: string;
  history: Array<{ date: string; action: string; agent: string }>;
}

// Generate large mock dataset
const mockPTPs: PromiseToPay[] = Array.from({ length: 45 }).map((_, i) => {
  const statuses: PTPStatus[] = ["Pending", "Kept", "Broken"];
  const agents = ["Agent Smith", "Agent Johnson", "Agent Davis", "Agent Lee"];
  const names = [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Evan",
    "Fiona",
    "George",
    "Hannah",
    "Ian",
    "Jane",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
  ];

  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const isOverdue = status === "Pending" && Math.random() > 0.5;

  const baseDate = new Date("2026-05-27T12:00:00Z");
  const daysOffset =
    Math.floor(Math.random() * 30) -
    (isOverdue || status !== "Pending" ? 15 : -1);
  baseDate.setDate(baseDate.getDate() + daysOffset);

  const brokenCount = Math.floor(Math.random() * 4);

  return {
    id: `PTP-${1000 + i}`,
    customerName: `${names[i % names.length]} ${lastNames[(i * 3) % lastNames.length]}`,
    accountNumber: `LOAN-${(2000 + i).toString().padStart(4, "0")}`,
    amount: Math.floor(Math.random() * 2500) + 100,
    dueDate: baseDate.toISOString().split("T")[0],
    status: status,
    brokenCount,
    assignedAgent: agents[Math.floor(Math.random() * agents.length)],
    phone: `+1 (555) ${(100 + i).toString().padStart(3, "0")}-${(1000 + i).toString().padStart(4, "0")}`,
    history: [
      {
        date: "2026-05-12T10:00:00Z",
        action: "Promise Created",
        agent: "System",
      },
      {
        date: "2026-05-15T09:30:00Z",
        action: "Automated SMS Reminder Sent",
        agent: "System",
      },
    ],
  };
});

type SortKey = keyof PromiseToPay;
type SortOrder = "asc" | "desc";

type FilterField = "amount" | "assignedAgent" | "brokenCount";
type FilterOperator = "gt" | "lt" | "eq" | "contains";

interface FilterItem {
  id: string;
  field: FilterField;
  operator: FilterOperator;
  value: string | number;
  label: string;
}

interface SavedView {
  id: string;
  name: string;
  tab: PTPStatus | "All";
  filters: FilterItem[];
}

export const ALL_PTP_COLUMNS: {
  key: string;
  label: string;
  mandatory?: boolean;
}[] = [
  { key: "customerName", label: "CUSTOMER / LOAN ID", mandatory: true },
  { key: "status", label: "STATUS" },
  { key: "amount", label: "AMOUNT" },
  { key: "dueDate", label: "DUE DATE" },
  { key: "brokenCount", label: "RISK PROFILE" },
  { key: "assignedAgent", label: "AGENT" },
];

export const DEFAULT_PTP_VISIBLE = [
  "customerName",
  "status",
  "amount",
  "dueDate",
  "brokenCount",
  "assignedAgent",
];

export default function PTPTrackerScreen() {
  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(DEFAULT_PTP_VISIBLE);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [ptps, setPtps] = useState<PromiseToPay[]>(mockPTPs);
  const [activeTab, setActiveTab] = useState<PTPStatus | "All">("All");

  const [globalSearch, setGlobalSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedPtpId, setSelectedPtpId] = useState<string | null>(null);

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isViewsMenuOpen, setIsViewsMenuOpen] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filterDraft, setFilterDraft] = useState({
    field: "amount",
    operator: "gt",
    value: "",
  });
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [isSavingView, setIsSavingView] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isExtendingDate, setIsExtendingDate] = useState(false);
  const [newExtensionDate, setNewExtensionDate] = useState("");

  const handleAddNote = (id: string) => {
    if (!newNote.trim()) {
      setIsAddingNote(false);
      return;
    }
    setPtps((prev) =>
      prev.map((ptp) =>
        ptp.id === id ? {
          ...ptp,
          history: [...ptp.history, { date: new Date().toISOString(), action: `Manual Note: ${newNote}`, agent: "Current User" }]
        } : ptp
      )
    );
    setNewNote("");
    setIsAddingNote(false);
  };

  const handleExtendPtpDate = (id: string) => {
    if (!newExtensionDate) {
      setIsExtendingDate(false);
      return;
    }
    setPtps((prev) =>
      prev.map((ptp) =>
        ptp.id === id ? {
          ...ptp,
          dueDate: newExtensionDate,
          history: [...ptp.history, { date: new Date().toISOString(), action: `Time Extension: ${ptp.dueDate} → ${newExtensionDate}`, agent: "Current User" }]
        } : ptp
      )
    );
    setNewExtensionDate("");
    setIsExtendingDate(false);
  };

  const [activeFilters, setActiveFilters] = useState<FilterItem[]>(() => {
    try {
      const saved = localStorage.getItem("ptp_active_filters");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [savedViews, setSavedViews] = useState<SavedView[]>(() => {
    try {
      const saved = localStorage.getItem("ptp_saved_views");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "v1",
        name: "My Broken PTPs Today",
        tab: "Broken",
        filters: [
          {
            id: "f-agent",
            field: "assignedAgent",
            operator: "contains",
            value: "Smith",
            label: "Agent Contains Smith",
          },
        ],
      },
      {
        id: "v2",
        name: "High-Value Critical Overdue",
        tab: "All",
        filters: [
          {
            id: "f-amt",
            field: "amount",
            operator: "gt",
            value: 1000,
            label: "Amount > 1000",
          },
        ],
      },
      {
        id: "v3",
        name: "Pending Verification (All)",
        tab: "Pending",
        filters: [],
      },
    ];
  });

  React.useEffect(() => {
    localStorage.setItem("ptp_active_filters", JSON.stringify(activeFilters));
  }, [activeFilters]);

  React.useEffect(() => {
    localStorage.setItem("ptp_saved_views", JSON.stringify(savedViews));
  }, [savedViews]);

  const applyDynamicFilter = () => {
    if (filterDraft.value === "") return;

    const fieldLabels: Record<string, string> = {
      amount: "Amount",
      assignedAgent: "Agent",
      brokenCount: "Broken Count",
    };
    const opLabels: Record<string, string> = {
      gt: ">",
      lt: "<",
      eq: "=",
      contains: "contains",
    };

    const label = `${fieldLabels[filterDraft.field]} ${opLabels[filterDraft.operator]} ${filterDraft.value}`;

    setActiveFilters([
      ...activeFilters,
      {
        id: Date.now().toString(),
        field: filterDraft.field as FilterField,
        operator: filterDraft.operator as FilterOperator,
        value: filterDraft.value,
        label,
      },
    ]);

    setIsFilterMenuOpen(false);
    setFilterDraft({ field: "amount", operator: "gt", value: "" });
    setCurrentPage(1);
    setActiveViewId(null);
  };

  const removeFilter = (id: string) => {
    setActiveFilters(activeFilters.filter((f) => f.id !== id));
    setActiveViewId(null);
  };

  const confirmSaveView = () => {
    if (!newViewName) return;
    const newId = Date.now().toString();
    const newView: SavedView = {
      id: newId,
      name: newViewName,
      tab: activeTab,
      filters: [...activeFilters],
    };
    setSavedViews([...savedViews, newView]);
    setActiveViewId(newId);
    setIsSavingView(false);
    setNewViewName("");
    setIsViewsMenuOpen(false);
  };

  const applyView = (view: SavedView) => {
    setActiveTab(view.tab);
    setActiveFilters(view.filters);
    setCurrentPage(1);
    setActiveViewId(view.id);
    setIsViewsMenuOpen(false);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const updateStatus = (id: string, newStatus: PTPStatus) => {
    setPtps((current) =>
      current.map((ptp) =>
        ptp.id === id
          ? {
              ...ptp,
              status: newStatus,
              history: [
                ...ptp.history,
                {
                  date: new Date().toISOString(),
                  action: `Marked as ${newStatus}`,
                  agent: "Current User",
                },
              ],
            }
          : ptp,
      ),
    );
    setSelectedPtpId(null);
  };

  const processedData = useMemo(() => {
    let result = ptps;

    if (activeTab !== "All") {
      result = result.filter((p) => p.status === activeTab);
    }

    if (activeFilters.length > 0) {
      activeFilters.forEach((f) => {
        if (f.field === "amount") {
          const val = Number(f.value) || 0;
          if (f.operator === "gt")
            result = result.filter((p) => p.amount > val);
          if (f.operator === "lt")
            result = result.filter((p) => p.amount < val);
          if (f.operator === "eq")
            result = result.filter((p) => p.amount === val);
        } else if (f.field === "assignedAgent") {
          const val = String(f.value).toLowerCase();
          if (f.operator === "contains")
            result = result.filter((p) =>
              p.assignedAgent.toLowerCase().includes(val),
            );
          if (f.operator === "eq")
            result = result.filter(
              (p) => p.assignedAgent.toLowerCase() === val,
            );
        } else if (f.field === "brokenCount") {
          const val = Number(f.value) || 0;
          if (f.operator === "gt")
            result = result.filter((p) => p.brokenCount > val);
          if (f.operator === "lt")
            result = result.filter((p) => p.brokenCount < val);
          if (f.operator === "eq")
            result = result.filter((p) => p.brokenCount === val);
        }
      });
    }

    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.customerName.toLowerCase().includes(q) ||
          p.accountNumber.toLowerCase().includes(q) ||
          p.assignedAgent.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });

    return result;
  }, [ptps, activeTab, globalSearch, sortKey, sortOrder, activeFilters]);

  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalFilteredValue = processedData.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );

  const formatFriendlyDate = (dueDate: string) => {
    const d = new Date(dueDate);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRelativeTime = (dueDate: string) => {
    const due = new Date(dueDate).getTime();
    const now = new Date("2026-05-27T00:00:00Z").getTime();
    const diffDays = Math.floor((due - now) / (1000 * 3600 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`;
    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "Due Tomorrow";
    return `Due in ${diffDays}d`;
  };

  const isOverdue = (dueDate: string, status: PTPStatus) => {
    if (status !== "Pending") return false;
    const due = new Date(dueDate).getTime();
    const now = new Date("2026-05-27T00:00:00Z").getTime();
    return due < now;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const selectedPtp = ptps.find((p) => p.id === selectedPtpId);

  return (
    <div className="flex w-full h-full bg-card  relative overflow-hidden font-sans">
      {/* Column Picker Modal */}
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
              <div className="px-6 py-4 bg-card  shrink-0 flex justify-between items-start">
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

              {/* Grid content container */}
              <div className="flex-1 overflow-y-auto p-4 bg-card  border-t border-border ">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                  {ALL_PTP_COLUMNS.map((col) => {
                    const isMandatory = col.mandatory;
                    const isSelected = visibleColumns.includes(col.key);

                    return (
                      <label
                        key={col.key}
                        className={`group cursor-pointer relative shrink-0 flex items-center p-3 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-primary/5 shadow-sm border-primary/20 hover:border-primary/40"
                            : "bg-card  border-border  hover:bg-muted  hover:border-border "
                        } ${isMandatory ? "opacity-80" : ""}`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          disabled={isMandatory}
                          onChange={(e) => {
                            if (e.target.checked)
                              setVisibleColumns([...visibleColumns, col.key]);
                            else
                              setVisibleColumns(
                                visibleColumns.filter((c) => c !== col.key),
                              );
                          }}
                        />
                        {/* Checkbox visual */}
                        <div
                          className={`w-4 h-4 mr-3 flex shrink-0 items-center justify-center transition-colors ${
                            isMandatory
                              ? "text-muted-foreground opacity-60"
                              : isSelected
                                ? "text-primary"
                                : "text-transparent"
                          }`}
                        >
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
              <div className="px-6 py-3 flex justify-end items-center bg-card  shrink-0 border-t border-border ">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setShowColumnPicker(false)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={`flex flex-col gap-4 flex-1 h-full overflow-hidden transition-all duration-300 ${selectedPtpId ? "mr-[40%]" : "mr-0"} px-8 pt-6`}
      >
        {/* Header */}
        <div className="flex justify-between items-end pb-1 shrink-0">
          <div>
            <p className="text-[9px] text-primary font-bold mb-0.5 uppercase tracking-[0.3em]">
              Recovery Management
            </p>
            <h2 className="text-2xl font-headline font-bold text-foreground tracking-tight">
              Promises to Pay
            </h2>
          </div>

          <div className="flex items-center gap-1.5 overflow-visible pb-1">
            <button
              onClick={() => {
                setActiveTab("All");
                setGlobalSearch("");
                setActiveFilters([]);
                setActiveViewId(null);
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
              className={`w-9 h-9 flex items-center justify-center rounded-lg border border-border  transition-colors shadow-sm ${showFilters ? "bg-primary/5 text-primary border-primary/40" : "bg-card  text-muted-foreground hover:text-primary"}`}
              title="Filters"
            >
              <span className="material-symbols-outlined text-[18px]">
                tune
              </span>
            </button>
            <ExportDropdown data={processedData} />
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className={`h-9 flex items-center gap-2 px-3 border border-border  rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0 transition-colors shadow-sm ${showColumnPicker ? "bg-primary/5 text-primary border-primary/40" : "bg-card  text-muted-foreground hover:border-primary/40 hover:text-primary"}`}
            >
              <span className="material-symbols-outlined text-[16px]">
                view_column
              </span>
              <span className="truncate max-w-[100px] hidden sm:block">
                Columns ({visibleColumns.length})
              </span>
            </button>
          </div>
        </div>

        {/* Filters and Command Bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: -16 }}
              animate={{ height: "auto", opacity: 1, marginTop: 0 }}
              exit={{ height: 0, opacity: 0, marginTop: -16 }}
              className="shrink-0 overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-3 bg-card  border border-border  rounded-xl p-2 shadow-sm">
                <div className="flex items-center gap-2 border border-border  rounded-lg px-2 py-1.5 bg-card  min-w-[180px] group focus-within:border-primary/40 transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-muted-foreground">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="SEARCH NAME, LOAN ID..."
                    value={globalSearch}
                    onChange={(e) => {
                      setGlobalSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="flex-1 bg-transparent border-none text-[9px] font-bold uppercase tracking-widest text-muted-foreground outline-none placeholder:text-muted-foreground/60 relative top-[0.5px]"
                  />
                </div>

                {activeFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center gap-1.5 bg-muted border border-border  text-foreground px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm"
                  >
                    <span>{filter.label}</span>
                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="text-muted-foreground/70 hover:text-muted-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <div className="relative">
                  <button
                    onClick={() => {
                      setIsFilterMenuOpen(!isFilterMenuOpen);
                      setIsViewsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 border border-border  border-dashed text-muted-foreground hover:text-foreground hover:border-border  px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      add
                    </span>
                    ADD FILTER
                  </button>

                  <AnimatePresence>
                    {isFilterMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 mt-2 w-72 bg-card  border border-border  shadow-lg rounded-xl z-50 p-3 flex flex-col gap-3"
                      >
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Create Custom Filter
                        </div>

                        <div className="flex flex-col gap-2">
                          <CustomSelect
                            value={filterDraft.field}
                            onChange={(val) =>
                              setFilterDraft({
                                ...filterDraft,
                                field: val,
                                operator:
                                  val === "assignedAgent"
                                    ? "contains"
                                    : "gt",
                                value: "",
                              })
                            }
                            options={[
                              { value: "amount", label: "Amount ($)" },
                              { value: "assignedAgent", label: "Agent Name" },
                              { value: "brokenCount", label: "Broken Count" },
                            ]}
                            className="w-full h-10 text-sm justify-between shadow-sm"
                          />
                          <CustomSelect
                            value={filterDraft.operator}
                            onChange={(val) =>
                              setFilterDraft({
                                ...filterDraft,
                                operator: val,
                              })
                            }
                            options={
                              filterDraft.field === "assignedAgent"
                                ? [
                                    { value: "contains", label: "Contains" },
                                    { value: "eq", label: "Is Exact" },
                                  ]
                                : [
                                    { value: "gt", label: "Greater Than" },
                                    { value: "lt", label: "Less Than" },
                                    { value: "eq", label: "Equals" },
                                  ]
                            }
                            className="w-full h-10 text-sm justify-between shadow-sm"
                          />
                          <input
                            type={
                              filterDraft.field === "assignedAgent"
                                ? "text"
                                : "number"
                            }
                            placeholder={
                              filterDraft.field === "assignedAgent"
                                ? "e.g. Smith"
                                : "e.g. 500"
                            }
                            className="w-full bg-card  border border-border  rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors shadow-sm placeholder:text-muted-foreground/70"
                            value={filterDraft.value}
                            onChange={(e) =>
                              setFilterDraft({
                                ...filterDraft,
                                value: e.target.value,
                              })
                            }
                          />
                        </div>

                        <button
                          onClick={applyDynamicFilter}
                          className="mt-1 w-full flex justify-center items-center gap-2 bg-on-surface text-surface py-2 rounded-lg py-2 px-4 shadow-sm hover:bg-on-surface-variant transition-colors text-sm font-semibold"
                        >
                          Apply Filter
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Card Row */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          <div className="bg-card  border border-border  rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                account_balance_wallet
              </span>
              Total Active Portfolio
            </div>
            <div className="text-2xl font-bold text-foreground font-mono tracking-tight">
              ${ptps.reduce((a, b) => a + b.amount, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-card  border border-border  rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                check_circle
              </span>
              Kept Rate
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-mono tracking-tight">
              {ptps.length
                ? (
                    (ptps.filter((p) => p.status === "Kept").length /
                      ptps.length) *
                    100
                  ).toFixed(1)
                : "0.0"}
              %
            </div>
          </div>
          <div className="bg-card  border border-border  rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                cancel
              </span>
              Broken Rate
            </div>
            <div className="text-2xl font-bold text-rose-600 font-mono tracking-tight">
              {ptps.length
                ? (
                    (ptps.filter((p) => p.status === "Broken").length /
                      ptps.length) *
                    100
                  ).toFixed(1)
                : "0.0"}
              %
            </div>
          </div>
          <div className="bg-card  border border-border  rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                hourglass_top
              </span>
              Pending Resolution
            </div>
            <div className="text-2xl font-bold text-amber-600 font-mono tracking-tight">
              {ptps.filter((p) => p.status === "Pending").length}
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="flex items-center gap-6 border-b border-border  px-2 shrink-0">
          {(["All", "Pending", "Kept", "Broken"] as const).map((tab) => {
            const count = ptps.filter((p) =>
              tab === "All" ? true : p.status === tab,
            ).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                  setActiveViewId(null);
                }}
                className={`relative pb-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "Pending" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500/100"></span>
                )}
                {tab === "Kept" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/100"></span>
                )}
                {tab === "Broken" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500/100"></span>
                )}
                {tab}
                <span
                  className={`py-0.5 px-2 rounded-full text-[10px] leading-none ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {count}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="ptp-tabs"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Digitalized Data Grid */}
        <div className="flex-1 overflow-auto min-h-0 bg-card  selection:bg-primary/20 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-max relative table-fixed">
            <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-md">
              <tr className="text-[7px] text-muted-foreground uppercase font-bold tracking-[0.25em] border-b border-border">
                {visibleColumns.includes("customerName") && (
                  <th
                    className="py-4 px-4 cursor-pointer transition-colors select-none font-headline group"
                    onClick={() => toggleSort("customerName")}
                  >
                    <div className="flex items-center gap-1.5">
                      CUSTOMER / LOAN ID
                      <span
                        className={`material-symbols-outlined text-[10px] transition-all ${sortKey === "customerName" ? "opacity-100 text-primary" : "opacity-0"}`}
                      >
                        {sortKey === "customerName" && sortOrder === "desc"
                          ? "keyboard_arrow_down"
                          : "keyboard_arrow_up"}
                      </span>
                    </div>
                  </th>
                )}
                {visibleColumns.includes("status") && (
                  <th
                    className="py-4 px-4 cursor-pointer transition-colors select-none font-headline group"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-1.5">
                      STATUS
                      <span
                        className={`material-symbols-outlined text-[10px] transition-all ${sortKey === "status" ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-50"}`}
                      >
                        {sortKey === "status" && sortOrder === "desc"
                          ? "keyboard_arrow_down"
                          : "keyboard_arrow_up"}
                      </span>
                    </div>
                  </th>
                )}
                {visibleColumns.includes("amount") && (
                  <th
                    className="py-4 px-4 cursor-pointer transition-colors select-none font-headline group"
                    onClick={() => toggleSort("amount")}
                  >
                    <div className="flex items-center gap-1.5">
                      AMOUNT
                      <span
                        className={`material-symbols-outlined text-[10px] transition-all ${sortKey === "amount" ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-50"}`}
                      >
                        {sortKey === "amount" && sortOrder === "desc"
                          ? "keyboard_arrow_down"
                          : "keyboard_arrow_up"}
                      </span>
                    </div>
                  </th>
                )}
                {visibleColumns.includes("dueDate") && (
                  <th
                    className="py-4 px-4 cursor-pointer transition-colors select-none font-headline group"
                    onClick={() => toggleSort("dueDate")}
                  >
                    <div className="flex items-center gap-1.5">
                      DUE DATE
                      <span
                        className={`material-symbols-outlined text-[10px] transition-all ${sortKey === "dueDate" ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-50"}`}
                      >
                        {sortKey === "dueDate" && sortOrder === "desc"
                          ? "keyboard_arrow_down"
                          : "keyboard_arrow_up"}
                      </span>
                    </div>
                  </th>
                )}
                {visibleColumns.includes("brokenCount") && (
                  <th
                    className="py-4 px-4 cursor-pointer transition-colors select-none font-headline group"
                    onClick={() => toggleSort("brokenCount")}
                  >
                    <div className="flex items-center gap-1.5">
                      RISK PROFILE
                      <span
                        className={`material-symbols-outlined text-[10px] transition-all ${sortKey === "brokenCount" ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-50"}`}
                      >
                        {sortKey === "brokenCount" && sortOrder === "desc"
                          ? "keyboard_arrow_down"
                          : "keyboard_arrow_up"}
                      </span>
                    </div>
                  </th>
                )}
                {visibleColumns.includes("assignedAgent") && (
                  <th className="py-4 px-4 font-headline uppercase">AGENT</th>
                )}
                <th className="py-4 px-4 text-center font-headline uppercase w-20 bg-muted/40">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="text-[10.5px] divide-y divide-outline/5">
              <AnimatePresence initial={false}>
                {currentData.length > 0 ? (
                  currentData.map((ptp, i) => {
                    const overdue = isOverdue(ptp.dueDate, ptp.status);
                    const isSelected = selectedPtpId === ptp.id;

                    return (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        key={ptp.id}
                        onClick={() => setSelectedPtpId(ptp.id)}
                        className={`group cursor-pointer bg-transparent border-l-2 border-transparent transition-all duration-200 
                        ${isSelected ? "bg-primary/5 shadow-sm relative z-0" : "hover:bg-muted "}`}
                      >
                        {visibleColumns.includes("customerName") && (
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm
                              ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                              >
                                {getInitials(ptp.customerName)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {ptp.customerName}
                                </span>
                                <span className="text-[11px] font-mono text-muted-foreground">
                                  {ptp.accountNumber}
                                </span>
                              </div>
                            </div>
                          </td>
                        )}
                        {visibleColumns.includes("status") && (
                          <td className="py-4 px-4 font-medium">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                            ${
                              ptp.status === "Pending"
                                ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                                : ptp.status === "Kept"
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                                  : "bg-rose-500/10 text-rose-700 border-rose-500/30"
                            }`}
                            >
                              {ptp.status === "Pending" && (
                                <Clock className="w-3 h-3 mr-1 opacity-70" />
                              )}
                              {ptp.status === "Kept" && (
                                <CheckCircle2 className="w-3 h-3 mr-1 opacity-70" />
                              )}
                              {ptp.status === "Broken" && (
                                <XCircle className="w-3 h-3 mr-1 opacity-70" />
                              )}
                              {ptp.status}
                            </span>
                          </td>
                        )}
                        {visibleColumns.includes("amount") && (
                          <td className="py-4 px-4 text-foreground/80 font-medium tracking-wide tabular-nums transition-colors">
                            <span className="text-sm font-semibold text-foreground font-mono tracking-tight">
                              $
                              {ptp.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </td>
                        )}
                        {visibleColumns.includes("dueDate") && (
                          <td className="py-4 px-4">
                            <div className="flex flex-col items-start gap-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                               ${
                                 overdue
                                   ? "bg-rose-500/20 text-rose-700"
                                   : getRelativeTime(ptp.dueDate) ===
                                       "Due Today"
                                     ? "bg-amber-500/20 text-amber-700"
                                     : "bg-muted text-foreground"
                               }
                             `}
                              >
                                {overdue && (
                                  <AlertTriangle className="w-3 h-3" />
                                )}
                                {!overdue &&
                                  getRelativeTime(ptp.dueDate) ===
                                    "Due Today" && (
                                    <Clock className="w-3 h-3" />
                                  )}
                                {getRelativeTime(ptp.dueDate)}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-medium ml-1">
                                {formatFriendlyDate(ptp.dueDate)}
                              </span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.includes("brokenCount") && (
                          <td className="py-4 px-4">
                            <div className="flex flex-col justify-center">
                              {ptp.brokenCount === 0 && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  <span className="text-[10px] font-medium uppercase tracking-wide">
                                    Reliable Payer
                                  </span>
                                </div>
                              )}
                              {ptp.brokenCount > 0 && ptp.brokenCount <= 2 && (
                                <div className="flex items-center gap-1.5 text-orange-600">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-medium uppercase tracking-wide">
                                    {ptp.brokenCount} Prior Broken
                                  </span>
                                </div>
                              )}
                              {ptp.brokenCount > 2 && (
                                <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                                  <Flag className="w-3.5 h-3.5" />
                                  <span className="text-[10px] uppercase tracking-wide">
                                    {ptp.brokenCount} Prior Broken
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                        {visibleColumns.includes("assignedAgent") && (
                          <td className="py-4 px-4 text-foreground/80 font-medium tracking-wide tabular-nums transition-colors">
                            <span className="text-xs font-medium text-muted-foreground">
                              {ptp.assignedAgent}
                            </span>
                          </td>
                        )}
                        <td className="py-4 px-4 text-center">
                          <button className="p-1 px-2 text-muted-foreground/70 hover:text-foreground hover:bg-muted rounded-md transition-colors">
                            <MoreHorizontal className="w-4 h-4 ml-auto mr-auto" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={visibleColumns.length + 1}
                      className="py-20 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center opacity-60">
                        <Search className="w-10 h-10 mb-3" />
                        <p className="text-sm font-medium">
                          No records match your filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="px-8 py-4 flex justify-between items-center bg-background border-t border-border  shrink-0">
          <div className="flex items-center gap-6">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em]">
              Records{" "}
              <span className="text-foreground">
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{" "}
              of{" "}
              <span className="text-foreground">
                {totalItems}
              </span>
            </p>
            <div className="w-px h-4 bg-outline/50"></div>
            <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-wider">
              <span className="text-muted-foreground">
                Value:{" "}
                <span className="text-foreground font-mono">
                  ${totalFilteredValue.toLocaleString()}
                </span>
              </span>
              <span className="text-muted-foreground">
                Yield: <span className="text-emerald-500">78.4%</span>
              </span>
            </div>
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
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                  currentPage === idx + 1
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/30"
                    : "bg-card  border border-border  text-muted-foreground"
                }`}
              >
                {idx + 1}
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

      {/* Split-Screen Sliding Drawer Workspace */}
      <div
        className={`fixed inset-y-0 right-0 w-[40%] min-w-[400px] bg-card  shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-l border-border  z-50 transform transition-transform duration-300 ease-in-out ${selectedPtpId ? "translate-x-0" : "translate-x-full"}`}
      >
        {selectedPtp && (
          <div className="h-full flex flex-col pt-16 md:pt-0">
            {/* Drawer Header */}
            <div className="px-8 py-6 border-b border-border flex justify-between items-start bg-card ">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg font-bold shadow-sm">
                  {getInitials(selectedPtp.customerName)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedPtp.customerName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-muted-foreground bg-accent  px-2 flex items-center rounded">
                      {selectedPtp.accountNumber}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {selectedPtp.phone}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPtpId(null)}
                className="p-2 text-muted-foreground/70 hover:text-foreground hover:bg-accent  rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-8">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card  border border-border  rounded-xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest pl-1">
                    Promised Amount
                  </span>
                  <div className="text-2xl font-bold text-foreground font-mono tracking-tight mt-1">
                    $
                    {selectedPtp.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="bg-card  border border-border  rounded-xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest pl-1">
                    Due Date
                  </span>
                  <div
                    className={`text-lg font-semibold mt-1 flex items-center gap-2 ${isOverdue(selectedPtp.dueDate, selectedPtp.status) ? "text-rose-600" : "text-foreground"}`}
                  >
                    {selectedPtp.dueDate}
                    {isOverdue(selectedPtp.dueDate, selectedPtp.status) && (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Instant Action Form */}
              {selectedPtp.status === "Pending" && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />{" "}
                    Resolution Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateStatus(selectedPtp.id, "Kept")}
                      className="flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border border-emerald-500/30 py-3 rounded-xl text-sm font-bold shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Kept
                    </button>
                    <button
                      onClick={() => updateStatus(selectedPtp.id, "Broken")}
                      className="flex items-center justify-center gap-2 bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 border border-rose-500/30 py-3 rounded-xl text-sm font-bold shadow-sm transition-all"
                    >
                      <XCircle className="w-4 h-4" /> Escalate (Broken)
                    </button>
                  </div>
                  {isExtendingDate ? (
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="z-[150] relative">
                        <CustomDatePicker
                          value={newExtensionDate}
                          onChange={setNewExtensionDate}
                          className="w-full h-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExtendPtpDate(selectedPtp.id)}
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          Save Date
                        </button>
                        <button
                          onClick={() => { setIsExtendingDate(false); setNewExtensionDate(""); }}
                          className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsExtendingDate(true)}
                      className="flex items-center justify-center gap-2 bg-card  text-foreground hover:bg-card  border border-border  py-3 rounded-xl text-sm font-semibold shadow-sm transition-all"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground/70" />{" "}
                      Log Time Extension
                    </button>
                  )}
                </div>
              )}

              {/* Micro-timeline */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />{" "}
                  Interaction Timeline
                </h3>
                <div className="relative pl-6 border-l-2 border-border flex flex-col gap-6 py-2">
                  {selectedPtp.history.map((evt, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-card  border-2 border-primary/30 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/100" />
                      </div>
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {evt.action}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {new Date(evt.date).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                          by {evt.agent}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-card  border-2 border-border  flex items-center justify-center" />
                    {isAddingNote ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          autoFocus
                          placeholder="Type your note here..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="bg-background border border-border rounded-lg px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddNote(selectedPtp.id)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          >
                            Save Note
                          </button>
                          <button
                            onClick={() => { setIsAddingNote(false); setNewNote(""); }}
                            className="bg-muted text-muted-foreground hover:bg-muted/80 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsAddingNote(true)}
                        className="text-sm font-medium text-primary hover:text-primary/80 hover:underline"
                      >
                        Add manual note...
                      </button>
                    )}
                  </div>
                </div>
              </div>


            </div>
          </div>
        )}
      </div>
    </div>
  );
}
