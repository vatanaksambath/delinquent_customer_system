import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ExportDropdown,
  RowActionMenu,
} from "@/features/accounts/components/LedgerTable";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";

const ALL_COLUMNS = [
  { key: "Accoun Num", label: "Accoun Num", mandatory: true },
  { key: "CID", label: "CID", mandatory: true },
  { key: "Customer Name", label: "Customer Name", mandatory: true },
  { key: "BRANCH_CODE", label: "BRANCH_CODE" },
  { key: "LOAN_CLASS", label: "LOAN_CLASS" },
  { key: "PAST_DUE", label: "PAST_DUE" },
  { key: "CREDIT_LIMIT", label: "CREDIT_LIMIT" },
  { key: "USD_Equivalent", label: "USD_Equivalent" },
  { key: "CURRENCY", label: "CURRENCY" },
  { key: "CONT_DATE", label: "CONT_DATE" },
  { key: "MAT_DATE", label: "MAT_DATE" },
  { key: "C_TYPE", label: "C_TYPE" },
  { key: "C_VALUE", label: "C_VALUE" },
  { key: "LOAN_OFFICER", label: "LOAN_OFFICER" },
  { key: "LOAN_FACILITY", label: "LOAN_FACILITY" },
  { key: "BUSS_TYPE", label: "BUSS_TYPE" },
  { key: "INIT_LOAN_OFFICER", label: "INIT_LOAN_OFFICER" },
  { key: "PRO_RATE", label: "PRO_RATE" },
  { key: "PRO_AMT", label: "PRO_AMT" },
  { key: "TB_ACCR", label: "TB_ACCR" },
  { key: "ACCR_ON_OVR_PR(PE)", label: "ACCR_ON_OVR_PR(PE)" },
  { key: "TOTAL_ACCRUED", label: "TOTAL_ACCRUED" },
  { key: "OVRDUE_PR", label: "OVRDUE_PR" },
  { key: "OVR_INT_THIS_MONTH", label: "OVR_INT_THIS_MONTH" },
  { key: "TOT_ASSET", label: "TOT_ASSET" },
  { key: "CUSTOMER_GRADE", label: "CUSTOMER_GRADE" },
  { key: "RM_NAME", label: "RM_NAME" },
  { key: "LRO_NAME", label: "LRO_NAME" },
  { key: "ROUT COURSE OF LOAN DEFAULT", label: "ROUT COURSE OF LOAN DEFAULT" },
  { key: "LEGAL ACTION", label: "LEGAL ACTION" },
  { key: "Region", label: "Region" },
  { key: "Call log report", label: "Call log report" },
  { key: "Issuing Letter", label: "Issuing Letter" },
  { key: "Recovery Report", label: "Recovery Report" },
  { key: "Possible Solution", label: "Possible Solution" },
  { key: "Specific Solution", label: "Specific Solution" },
  { key: "Solution status", label: "Solution status" },
  { key: "Next Action", label: "Next Action" },
  { key: "Exspected Date", label: "Exspected Date" },
  { key: "Remarks", label: "Remarks" },
  { key: "Last Call/Visit Date", label: "Last Call/Visit Date" },
  { key: "Action_View", label: "Action_View" },
];

const generateSampleData = (count: number) => {
  const branches = ["016", "012", "045", "089", "112"];
  const loanClasses = ["DOUBTFUL", "SUB-STANDARD", "LOSS", "NPL", "NORMAL"];
  const currencies = ["USD", "KHR"];
  const officers = [
    "Samnang K.",
    "Vannak S.",
    "Sophorn T.",
    "Dara V.",
    "Sokha M.",
  ];
  const grades = ["A", "B+", "C-", "D", "B"];

  return Array.from({ length: count }).map((_, i) => ({
    "Accoun Num": `016-${(1000000 + i).toString().padStart(10, "0")}`,
    CID: (459000 + i).toString(),
    "Customer Name": [
      "CHHEANG SOPHOAN",
      "KEO SARATH",
      "MOK SOKHA",
      "PEN VIBOL",
      "SENG RATHA",
    ][i % 5],
    BRANCH_CODE: branches[i % branches.length],
    LOAN_CLASS: loanClasses[i % loanClasses.length],
    PAST_DUE: (i * 15).toString(),
    CREDIT_LIMIT: (50000 + i * 5000).toLocaleString(),
    USD_Equivalent: (45000 + i * 4500).toLocaleString(),
    CURRENCY: currencies[i % 2],
    CONT_DATE: `2023-${((i % 12) + 1).toString().padStart(2, "0")}-15`,
    MAT_DATE: `2028-${((i % 12) + 1).toString().padStart(2, "0")}-15`,
    C_TYPE: "Property",
    C_VALUE: (100000 + i * 10000).toLocaleString(),
    LOAN_OFFICER: officers[i % officers.length],
    LOAN_FACILITY: "Term Loan",
    BUSS_TYPE: "Retail",
    INIT_LOAN_OFFICER: officers[(i + 1) % officers.length],
    PRO_RATE: `${(7 + (i % 5) * 0.5).toFixed(1)}%`,
    PRO_AMT: (1000 + i * 100).toLocaleString(),
    TB_ACCR: (4000 + i * 250).toLocaleString(),
    "ACCR_ON_OVR_PR(PE)": (1000 + i * 50).toLocaleString(),
    TOTAL_ACCRUED: (5000 + i * 300).toLocaleString(),
    OVRDUE_PR: (10000 + i * 500).toLocaleString(),
    OVR_INT_THIS_MONTH: (500 + i * 20).toLocaleString(),
    TOT_ASSET: (400000 + i * 5000).toLocaleString(),
    CUSTOMER_GRADE: grades[i % grades.length],
    RM_NAME: officers[(i + 2) % officers.length],
    LRO_NAME: officers[(i + 3) % officers.length],
    Region: i % 2 === 0 ? "Phnom Penh" : "Siem Reap",
    "ROUT COURSE OF LOAN DEFAULT": "Business Failure",
    "LEGAL ACTION": i % 3 === 0 ? "Legal Case" : "Non Legal Case",
    "Call log report": "View",
    "Issuing Letter": `${(i % 3) + 1}st Warning`,
    "Recovery Report": i % 2 === 0 ? "Pending" : "Completed",
    "Possible Solution": i % 2 === 0 ? "Restructure" : "Refinance",
    "Specific Solution": i % 2 === 0 ? "Lower Interest" : "Extension",
    "Solution status": ["Under Review", "Approved", "Rejected"][i % 3],
    "Next Action": "Site Visit",
    "Exspected Date": "2024-05-10",
    Remarks: "Regular follow up",
    "Last Call/Visit Date": "2024-04-20",
    Action_View: "Details",
  }));
};

const SAMPLE_DATA = generateSampleData(50);

export default function PortfolioReportScreen({
  onCallSiteVisit,
}: {
  onCallSiteVisit?: (data: any) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ALL_COLUMNS.slice(0, 15).map((c) => c.key),
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  // Updated filters
  const [filterDate, setFilterDate] = useState("");
  const [productGroup, setProductGroup] = useState("ALL");
  const [region, setRegion] = useState("ALL");
  const [branch, setBranch] = useState("ALL");
  const [lrm, setLrm] = useState("ALL");
  const [lro, setLro] = useState("ALL");
  const [legalAction, setLegalAction] = useState("ALL");
  const [possibleSolution, setPossibleSolution] = useState("ALL");
  const [specificSolution, setSpecificSolution] = useState("ALL");
  const [solutionStatus, setSolutionStatus] = useState("ALL");

  const [showFilters, setShowFilters] = useState(false);

  const filteredData = useMemo(() => {
    return SAMPLE_DATA.filter((item) => {
      const matchesSearch = Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase()),
      );

      const matchesDate = !filterDate || item.CONT_DATE === filterDate;

      const matchesProduct =
        productGroup === "ALL" || item.LOAN_FACILITY === productGroup;
      const matchesBranch = branch === "ALL" || item.BRANCH_CODE === branch;
      const matchesLegal =
        legalAction === "ALL" || item["LEGAL ACTION"] === legalAction;
      const matchesPossibleSolution =
        possibleSolution === "ALL" ||
        item["Possible Solution"] === possibleSolution;
      const matchesSpecificSolution =
        specificSolution === "ALL" ||
        item["Specific Solution"] === specificSolution;
      const matchesStatus =
        solutionStatus === "ALL" || item["Solution status"] === solutionStatus;
      const matchesLro = lro === "ALL" || item.LRO_NAME === lro;
      const matchesLrm = lrm === "ALL" || item.RM_NAME === lrm;
      const matchesRegion = region === "ALL" || item.Region === region;

      return (
        matchesSearch &&
        matchesDate &&
        matchesProduct &&
        matchesBranch &&
        matchesLegal &&
        matchesPossibleSolution &&
        matchesSpecificSolution &&
        matchesStatus &&
        matchesLro &&
        matchesLrm &&
        matchesRegion
      );
    });
  }, [
    searchTerm,
    filterDate,
    productGroup,
    region,
    branch,
    legalAction,
    possibleSolution,
    specificSolution,
    solutionStatus,
    lro,
    lrm,
  ]);

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key)
        ? ALL_COLUMNS.find((c) => c.key === key)?.mandatory
          ? prev
          : prev.filter((k) => k !== key)
        : [...prev, key],
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-4 h-full overflow-hidden px-8"
    >
      <div className="flex flex-wrap justify-between items-center bg-card pb-4 border-b border-border gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-primary px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20">
            <h2 className="text-primary-foreground font-black text-sm tracking-widest uppercase font-headline">
              Delinquent Customer Monitoring Report
            </h2>
          </div>
          <div className="h-4 w-[1px] bg-outline/30"></div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Global Status
            </span>
            <span className="digital-badge bg-green-500/10 text-green-500">
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative group mr-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="SEARCH ACCOUNT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-muted border border-border rounded-xl pl-10 pr-4 py-2 text-[10px] uppercase font-bold tracking-widest text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 w-48 transition-all shadow-sm"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 px-4 rounded-xl border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest relative cursor-pointer ${
              showFilters
                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-accent border-border text-muted-foreground hover:text-primary hover:border-primary/40"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              filter_list
            </span>
            {showFilters ? "Hide Filters" : "Show Filters"}
            {(filterDate ||
              productGroup !== "ALL" ||
              region !== "ALL" ||
              branch !== "ALL" ||
              lrm !== "ALL" ||
              lro !== "ALL" ||
              legalAction !== "ALL" ||
              possibleSolution !== "ALL" ||
              specificSolution !== "ALL" ||
              solutionStatus !== "ALL") &&
              !showFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-surface animate-pulse"></span>
              )}
          </button>

          <button
            onClick={() => setShowColumnPicker(true)}
            className="h-10 px-4 rounded-xl bg-accent border border-border text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              view_column
            </span>
            Columns
          </button>

          <ExportDropdown data={filteredData as any} />
        </div>
      </div>

      {/* Filters Grid - Collapsible */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden bg-card  rounded-2xl border border-border "
          >
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  Filter By Date
                </label>
                <CustomDatePicker
                  value={filterDate}
                  onChange={setFilterDate}
                  className="w-full h-10"
                />
              </div>

              <CustomSelect
                label="Filter By Product Group"
                value={productGroup}
                onChange={setProductGroup}
                options={["ALL", "Term Loan", "Overdraft"].map(o => ({ value: o, label: o === "ALL" ? "ALL PRODUCTS" : o }))}
              />

              <CustomSelect
                label="Filter By Region"
                value={region}
                onChange={setRegion}
                options={["ALL", "Phnom Penh", "Siem Reap"].map(o => ({ value: o, label: o === "ALL" ? "ALL REGIONS" : o }))}
              />

              <CustomSelect
                label="Filter By Branch"
                value={branch}
                onChange={setBranch}
                options={[
                  { value: "ALL", label: "ALL BRANCHES" },
                  { value: "016", label: "Branch 016" },
                  { value: "012", label: "Branch 012" },
                  { value: "045", label: "Branch 045" },
                ]}
              />

              <CustomSelect
                label="Filter By LRM"
                value={lrm}
                onChange={setLrm}
                options={["ALL", "Sophorn T.", "Dara V."].map(o => ({ value: o, label: o === "ALL" ? "ALL LRMs" : o }))}
              />

              <CustomSelect
                label="Filter By LRO"
                value={lro}
                onChange={setLro}
                options={["ALL", "Samnang K.", "Vannak S."].map(o => ({ value: o, label: o === "ALL" ? "ALL LROs" : o }))}
              />

              <CustomSelect
                label="Filter By Legal Action"
                value={legalAction}
                onChange={setLegalAction}
                options={["ALL", "Legal Case", "Non Legal Case"].map(o => ({ value: o, label: o === "ALL" ? "ALL ACTIONS" : o }))}
              />

              <CustomSelect
                label="Filter By Possible Solution"
                value={possibleSolution}
                onChange={setPossibleSolution}
                options={["ALL", "Restructure", "Refinance"].map(o => ({ value: o, label: o === "ALL" ? "ALL SOLUTIONS" : o }))}
              />

              <CustomSelect
                label="Filter By Specific Solution"
                value={specificSolution}
                onChange={setSpecificSolution}
                options={["ALL", "Lower Interest", "Extension"].map(o => ({ value: o, label: o === "ALL" ? "ALL SPECIFIC SOLUTIONS" : o }))}
              />

              <CustomSelect
                label="Filter By Solution status"
                value={solutionStatus}
                onChange={setSolutionStatus}
                options={["ALL", "Under Review", "Approved", "Rejected"].map(o => ({ value: o, label: o === "ALL" ? "ALL STATUSES" : o }))}
              />

              <div className="flex items-end lg:col-start-5">
                <button
                  onClick={() => {
                    setFilterDate("");
                    setProductGroup("ALL");
                    setBranch("ALL");
                    setLegalAction("ALL");
                    setSolutionStatus("ALL");
                    setPossibleSolution("ALL");
                    setLro("ALL");
                    setRegion("ALL");
                    setLrm("ALL");
                    setSpecificSolution("ALL");
                  }}
                  className="w-full h-9 rounded-xl border border-border text-muted-foreground hover:text-red-500 hover:border-red-400/50 hover:bg-red-500/5 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-hidden modern-card flex flex-col mb-10">
        <div className="overflow-auto custom-scrollbar flex-1 relative">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="bg-accent  backdrop-blur-md">
                {ALL_COLUMNS.filter((c) => visibleColumns.includes(c.key)).map(
                  (col, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="group hover:bg-primary/5 transition-colors border-b border-border last:border-0"
                >
                  {ALL_COLUMNS.filter((c) =>
                    visibleColumns.includes(c.key),
                  ).map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 py-5 text-[11px] font-bold whitespace-nowrap tracking-wide ${
                        col.key === "Accoun Num"
                          ? "text-primary"
                          : "text-foreground/80"
                      }`}
                    >
                      {col.key === "Action_View" ? (
                        <RowActionMenu
                          entry={row as any}
                          onAction={onCallSiteVisit}
                        />
                      ) : (
                        row[col.key as keyof typeof row]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-8 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-muted/60 border border-border/60 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-muted-foreground/40">search_off</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground/70 uppercase tracking-widest mb-1">No Matching Records</p>
                <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                  No records match your active filters. Try broadening your search or resetting the filters.
                </p>
              </div>
              <button
                onClick={() => setSearchTerm("")}
                className="flex items-center gap-1.5 text-[9px] font-bold text-primary/70 hover:text-primary uppercase tracking-widest transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[12px]">restart_alt</span>
                <span>Clear Search</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showColumnPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowColumnPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-muted border border-border  rounded-3xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 py-6 border-b border-border  flex justify-between items-center bg-card ">
                <div>
                  <h3 className="text-lg font-black text-foreground uppercase tracking-tight font-headline">
                    Customize Columns
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    Select visibility of data fields
                  </p>
                </div>
                <button
                  onClick={() => setShowColumnPicker(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-outline/10 text-muted-foreground transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ALL_COLUMNS.map((col) => (
                    <label
                      key={col.key}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                        visibleColumns.includes(col.key)
                          ? "border-primary/40 bg-primary/5 text-primary"
                          : "border-border  bg-card  text-muted-foreground hover:border-primary/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={() => toggleColumn(col.key)}
                        className="hidden"
                      />
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          visibleColumns.includes(col.key)
                            ? "bg-primary border-primary"
                            : "border-border "
                        }`}
                      >
                        {visibleColumns.includes(col.key) && (
                          <span className="material-symbols-outlined text-primary-foreground text-sm">
                            check
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {col.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-8 py-4 bg-card  border-t border-border  flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>{visibleColumns.length} Columns Visible</span>
                <button
                  onClick={() => setShowColumnPicker(false)}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Apply Configuration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
