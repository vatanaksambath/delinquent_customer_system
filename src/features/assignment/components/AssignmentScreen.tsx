import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UserCircle,
  Search,
  Filter,
  CheckCircle2,
  X,
  ArrowRightLeft,
  Briefcase,
  AlertOctagon,
  ChevronDown,
  Users,
  Check,
  ShieldCheck,
  Clock
} from "lucide-react";
import { SAMPLE_DATA } from "@/types";

// Mock RO Data
const RO_LIST = [
  { id: "RO-001", name: "David Chen", role: "Senior RO", active: true },
  { id: "RO-002", name: "Sarah Jenkins", role: "RO", active: true },
  { id: "RO-003", name: "Marcus Sterling", role: "RO", active: true },
  { id: "RO-004", name: "Eleanor Vance", role: "Junior RO", active: true },
  { id: "RO-005", name: "John Doe", role: "RO (On Leave)", active: false },
];

// Maker-Checker Types
type RequestType = "manual" | "takeover";
interface PendingRequest {
  id: string;
  type: RequestType;
  sourceRoName?: string;
  targetRoName: string;
  accountIds: string[]; // empty if full takeover
  requestor: string;
  timestamp: string;
}

export default function AssignmentScreen() {
  const [activeTab, setActiveTab] = useState<"manual" | "takeover" | "approvals">("manual");
  
  // Local state
  const [accounts, setAccounts] = useState(SAMPLE_DATA);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Reassign Modal State (Maker)
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [targetRoId, setTargetRoId] = useState("");

  // Takeover State (Maker)
  const [sourceRoId, setSourceRoId] = useState("");
  const [takeoverTargetRoId, setTakeoverTargetRoId] = useState("");
  const [takeoverSelectedIds, setTakeoverSelectedIds] = useState<string[]>([]);

  // Maker-Checker State
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([
    // Mock an existing pending request for demonstration
    {
      id: "REQ-9901",
      type: "manual",
      targetRoName: "Eleanor Vance",
      accountIds: [SAMPLE_DATA[0].account_number, SAMPLE_DATA[1].account_number],
      requestor: "System Admin",
      timestamp: "Just now"
    }
  ]);
  const [toastMessage, setToastMessage] = useState("");

  // Filtered accounts for manual
  const filteredAccounts = useMemo(() => {
    return accounts.filter(
      (a) =>
        a.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.account_number.includes(searchTerm) ||
        a.lro_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  // Handlers
  const toggleSelectAll = () => {
    if (selectedAccountIds.length === filteredAccounts.length) {
      setSelectedAccountIds([]);
    } else {
      setSelectedAccountIds(filteredAccounts.map((a) => a.account_number));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // MAKER ACTIONS
  const handleReassignSubmit = () => {
    if (!targetRoId || selectedAccountIds.length === 0) return;
    const targetRo = RO_LIST.find((r) => r.id === targetRoId);
    if (!targetRo) return;

    const newReq: PendingRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      type: "manual",
      targetRoName: targetRo.name,
      accountIds: [...selectedAccountIds],
      requestor: "Current User",
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setPendingRequests(prev => [newReq, ...prev]);
    setSelectedAccountIds([]);
    setIsReassignModalOpen(false);
    setTargetRoId("");
    showToast("Reassignment request submitted for approval.");
  };

  const handleTakeoverSubmit = () => {
    if (!sourceRoId || !takeoverTargetRoId) return;
    const sourceRo = RO_LIST.find((r) => r.id === sourceRoId);
    const targetRo = RO_LIST.find((r) => r.id === takeoverTargetRoId);
    if (!sourceRo || !targetRo) return;

    const isFullTakeover = takeoverSelectedIds.length === sourceRoAccounts.length;

    const newReq: PendingRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      type: isFullTakeover ? "takeover" : "manual",
      sourceRoName: sourceRo.name,
      targetRoName: targetRo.name,
      accountIds: isFullTakeover ? [] : [...takeoverSelectedIds], // represents ALL if empty and takeover
      requestor: "Current User",
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setPendingRequests(prev => [newReq, ...prev]);
    setSourceRoId("");
    setTakeoverTargetRoId("");
    showToast("Takeover request submitted for approval.");
  };

  // CHECKER ACTIONS
  const handleApprove = (reqId: string) => {
    const req = pendingRequests.find(r => r.id === reqId);
    if (!req) return;

    // Execute logic
    setAccounts(prev => prev.map(a => {
      if (req.type === "manual" && req.accountIds.includes(a.account_number)) {
        return { ...a, lro_name: req.targetRoName };
      }
      if (req.type === "takeover" && a.lro_name === req.sourceRoName) {
        return { ...a, lro_name: req.targetRoName };
      }
      return a;
    }));

    setPendingRequests(prev => prev.filter(r => r.id !== reqId));
    showToast(`Request ${reqId} Approved successfully.`);
  };

  const handleReject = (reqId: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== reqId));
    showToast(`Request ${reqId} Rejected.`);
  };

  // Stats for Takeover view
  const sourceRoAccounts = useMemo(() => {
    const ro = RO_LIST.find((r) => r.id === sourceRoId);
    if (!ro) return [];
    return accounts.filter((a) => a.lro_name === ro.name);
  }, [sourceRoId, accounts]);

  useEffect(() => {
    // Default to selecting all accounts when source RO changes
    setTakeoverSelectedIds(sourceRoAccounts.map(a => a.account_number));
  }, [sourceRoAccounts]);

  const toggleTakeoverSelect = (id: string) => {
    setTakeoverSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleTakeoverSelectAll = () => {
    if (takeoverSelectedIds.length === sourceRoAccounts.length) {
      setTakeoverSelectedIds([]);
    } else {
      setTakeoverSelectedIds(sourceRoAccounts.map(a => a.account_number));
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-foreground text-background px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-3"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-8 pt-8 pb-4 shrink-0 bg-card border-b border-border z-20 relative shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 flex items-center justify-center">
            <ArrowRightLeft className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline leading-tight">
              Portfolio Reassignment
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage workload distribution, assign unassigned PARs, or execute portfolio takeovers.
            </p>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-8 border-b border-border">
          <button
            onClick={() => setActiveTab("manual")}
            className={`pb-4 text-sm font-bold transition-colors relative ${
              activeTab === "manual" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Manual Assignment
            {activeTab === "manual" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("takeover")}
            className={`pb-4 text-sm font-bold transition-colors relative ${
              activeTab === "takeover" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            RO Takeover
            {activeTab === "takeover" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            className={`pb-4 text-sm font-bold transition-colors relative flex items-center gap-2 ${
              activeTab === "approvals" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Approvals
            {pendingRequests.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
            {activeTab === "approvals" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-background">
        <AnimatePresence mode="wait">
          
          {/* ─── MANUAL TAB ─── */}
          {activeTab === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 max-w-[1600px] mx-auto w-full"
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-96 group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-300"></div>
                  <div className="relative flex items-center bg-card border border-border/50 rounded-xl shadow-sm">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3" />
                    <input
                      type="text"
                      placeholder="Search accounts, customer, or RO..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent border-none py-2.5 pl-10 pr-4 text-sm font-medium text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-bold text-foreground flex items-center gap-2 hover:bg-muted transition-colors shadow-sm">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    Filter Portfolio
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="py-4 px-6 w-12">
                        <div 
                          onClick={toggleSelectAll}
                          className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer border transition-colors ${
                            selectedAccountIds.length > 0 && selectedAccountIds.length === filteredAccounts.length
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-background border-border/80 hover:border-blue-400"
                          }`}
                        >
                          {selectedAccountIds.length > 0 && selectedAccountIds.length === filteredAccounts.length && (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </th>
                      <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer & Account</th>
                      <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Loan Product</th>
                      <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Balance (USD)</th>
                      <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">DPD</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Current RO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredAccounts.map((account) => {
                      const isSelected = selectedAccountIds.includes(account.account_number);
                      return (
                        <tr 
                          key={account.account_number}
                          className={`hover:bg-muted/30 transition-colors group cursor-pointer ${isSelected ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                          onClick={() => toggleSelect(account.account_number)}
                        >
                          <td className="py-3 px-6">
                            <div 
                              className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/30"
                                  : "bg-background border-border/80 group-hover:border-blue-400"
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm font-bold text-foreground">{account.customer_name}</p>
                            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{account.account_number}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                              {account.loan_class}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <p className="text-sm font-bold font-mono text-foreground">${(account.usd_equivalent || 0).toLocaleString()}</p>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
                              (account.past_due || 0) >= 60 ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800" :
                              (account.past_due || 0) >= 30 ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" :
                              "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                            }`}>
                              {(account.past_due || 0) > 0 ? `${account.past_due} Days` : "Current"}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                {account.lro_name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-foreground">{account.lro_name}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredAccounts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          No accounts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Floating Action Bar */}
              <AnimatePresence>
                {selectedAccountIds.length > 0 && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-xl border border-border shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-8 z-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                        {selectedAccountIds.length}
                      </div>
                      <span className="text-sm font-bold text-foreground">Accounts Selected</span>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSelectedAccountIds([])}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => setIsReassignModalOpen(true)}
                        className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                      >
                        <UserCircle className="w-4 h-4" />
                        Reassign To...
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ─── TAKEOVER TAB ─── */}
          {activeTab === "takeover" && (
            <motion.div
              key="takeover"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 max-w-6xl mx-auto w-full"
            >
              <div className="text-center max-w-2xl mx-auto mb-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-foreground mb-4">Portfolio Takeover</h2>
                <p className="text-muted-foreground">
                  Submit a request to instantly transfer an entire portfolio from one Relationship Officer to another.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center bg-card border border-border rounded-3xl p-8 shadow-sm">
                
                {/* Source Side */}
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Source RO (Transferring From)</label>
                    <div className="relative">
                      <select 
                        value={sourceRoId}
                        onChange={(e) => setSourceRoId(e.target.value)}
                        className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Source RO...</option>
                        {RO_LIST.map((ro) => (
                          <option key={ro.id} value={ro.id}>{ro.name} - {ro.id}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {sourceRoId && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-muted/50 rounded-2xl p-5 border border-border flex flex-col gap-4"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <AlertOctagon className="w-4 h-4 text-blue-500" /> Portfolio Snapshot
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Accounts</p>
                              <p className="text-2xl font-bold text-foreground">{sourceRoAccounts.length}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Exposure</p>
                              <p className="text-xl font-bold font-mono text-foreground">${sourceRoAccounts.reduce((sum, a) => sum + (a.usd_equivalent || 0), 0).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Partial Selection List */}
                        {sourceRoAccounts.length > 0 && (
                          <div className="mt-2 border-t border-border pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Accounts</label>
                              <button 
                                onClick={toggleTakeoverSelectAll}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                              >
                                {takeoverSelectedIds.length === sourceRoAccounts.length ? "Deselect All" : "Select All"}
                              </button>
                            </div>
                            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                              {sourceRoAccounts.map(account => {
                                const isSelected = takeoverSelectedIds.includes(account.account_number);
                                return (
                                  <div 
                                    key={account.account_number}
                                    onClick={() => toggleTakeoverSelect(account.account_number)}
                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                                      isSelected ? "bg-blue-50/50 border-blue-500 dark:bg-blue-900/20" : "bg-card border-border hover:border-blue-300"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                        isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-muted-foreground/40"
                                      }`}>
                                        {isSelected && <Check className="w-3 h-3" />}
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-foreground">{account.customer_name}</p>
                                        <p className="text-[10px] font-mono text-muted-foreground">{account.account_number}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-bold text-foreground">${(account.usd_equivalent || 0).toLocaleString()}</p>
                                      <p className="text-[10px] font-bold text-rose-500">{account.past_due} DPD</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Center Graphic */}
                <div className="flex justify-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${sourceRoId && takeoverTargetRoId ? 'bg-blue-600 shadow-xl shadow-blue-500/30' : 'bg-muted border border-border'}`}>
                    <ArrowRightLeft className={`w-6 h-6 transition-colors ${sourceRoId && takeoverTargetRoId ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                </div>

                {/* Target Side */}
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Destination RO (Transferring To)</label>
                    <div className="relative">
                      <select 
                        value={takeoverTargetRoId}
                        onChange={(e) => setTakeoverTargetRoId(e.target.value)}
                        className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Destination RO...</option>
                        {RO_LIST.map((ro) => (
                          <option key={ro.id} value={ro.id} disabled={ro.id === sourceRoId}>{ro.name} - {ro.id}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {takeoverTargetRoId && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Ready to Receive</p>
                            <p className="text-xs text-muted-foreground">Will inherit {takeoverSelectedIds.length} accounts</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* Action Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleTakeoverSubmit}
                  disabled={!sourceRoId || !takeoverTargetRoId || takeoverSelectedIds.length === 0}
                  className="px-8 py-4 bg-foreground text-background rounded-2xl font-bold shadow-xl shadow-foreground/10 hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
                >
                  Submit for Approval ({takeoverSelectedIds.length === sourceRoAccounts.length ? "Full" : "Partial"} Takeover)
                  <ShieldCheck className="w-5 h-5" />
                </button>
              </div>

            </motion.div>
          )}

          {/* ─── APPROVALS TAB (CHECKER VIEW) ─── */}
          {activeTab === "approvals" && (
            <motion.div
              key="approvals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 max-w-5xl mx-auto w-full"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-foreground">Pending Approvals</h2>
                <p className="text-muted-foreground mt-1">Review and approve portfolio reassignment requests submitted by agents.</p>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-20 bg-card border border-border rounded-3xl shadow-sm">
                  <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">There are no pending reassignment requests at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {pendingRequests.map((req) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98, height: 0, marginBottom: 0 }}
                        className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 md:items-center justify-between group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                              {req.id}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                              req.type === 'takeover' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                            }`}>
                              {req.type === 'takeover' ? 'Full Takeover' : 'Manual Assignment'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            {req.type === 'takeover' ? (
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-bold text-foreground">{req.sourceRoName}</div>
                                <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{req.targetRoName}</div>
                                <span className="text-xs text-muted-foreground">(Entire Portfolio)</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-foreground bg-muted px-2 py-1 rounded-md">{req.accountIds.length} Accounts</span>
                                <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{req.targetRoName}</div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5" /> {req.requestor}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {req.timestamp}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-2"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Approve
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Reassign Modal (Maker) */}
      <AnimatePresence>
        {isReassignModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
              onClick={() => setIsReassignModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden z-50"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Reassign {selectedAccountIds.length} Accounts</h3>
                <button 
                  onClick={() => setIsReassignModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Select Relationship Officer</label>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {RO_LIST.map((ro) => (
                    <label 
                      key={ro.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                        targetRoId === ro.id 
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" 
                          : "border-border hover:border-blue-300"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="targetRo" 
                        value={ro.id}
                        checked={targetRoId === ro.id}
                        onChange={() => setTargetRoId(ro.id)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="text-sm font-bold text-foreground">{ro.name}</p>
                        <p className="text-xs text-muted-foreground">{ro.role} • {ro.id}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button
                  onClick={() => setIsReassignModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReassignSubmit}
                  disabled={!targetRoId}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  Submit for Approval <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
