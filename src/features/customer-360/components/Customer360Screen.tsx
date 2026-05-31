"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  UserCircle,
  Building2,
  Wallet,
  AlertOctagon,
  Clock,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  CreditCard,
  Car,
  Home,
  Briefcase,
  FileText,
  Activity,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { SAMPLE_DATA, LedgerEntry } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getProductIcon(loanClass: string) {
  const lc = loanClass.toLowerCase();
  if (lc.includes("auto") || lc.includes("vehicle")) return <Car className="w-5 h-5" />;
  if (lc.includes("mortgage") || lc.includes("home") || lc.includes("real estate")) return <Home className="w-5 h-5" />;
  if (lc.includes("corporate") || lc.includes("commercial") || lc.includes("venture")) return <Building2 className="w-5 h-5" />;
  if (lc.includes("personal") || lc.includes("student") || lc.includes("micro")) return <UserCircle className="w-5 h-5" />;
  return <CreditCard className="w-5 h-5" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Customer360Screen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCid, setSelectedCid] = useState<string | null>(null);

  // Group data by customer
  const customers = useMemo(() => {
    const map = new Map<string, LedgerEntry[]>();
    SAMPLE_DATA.forEach((entry) => {
      if (!map.has(entry.cid)) map.set(entry.cid, []);
      map.get(entry.cid)!.push(entry);
    });

    const list = Array.from(map.entries()).map(([cid, accounts]) => {
      const name = accounts[0].customer_name;
      const totalExposure = accounts.reduce((sum, acc) => sum + (acc.usd_equivalent || 0), 0);
      const totalOverdue = accounts.reduce((sum, acc) => sum + (acc.ovrdue_pr || 0), 0);
      const maxDpd = Math.max(...accounts.map((a) => a.past_due || 0));
      const worstGrade = accounts.sort((a, b) => (a.customer_grade > b.customer_grade ? 1 : -1))[0].customer_grade;
      
      return { cid, name, accounts, totalExposure, totalOverdue, maxDpd, worstGrade };
    });

    if (!searchTerm) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter(
      (c) => c.name.toLowerCase().includes(lower) || c.cid.toLowerCase().includes(lower)
    );
  }, [searchTerm]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCid) return null;
    return customers.find((c) => c.cid === selectedCid) || null;
  }, [selectedCid, customers]);

  // Aggregate History Timeline
  const timelineEvents = useMemo(() => {
    if (!selectedCustomer) return [];
    const events: { date: string; title: string; desc: string; account: string; type: "contact" | "promise" | "legal" }[] = [];
    
    selectedCustomer.accounts.forEach(acc => {
      if (acc.last_call_visit_date) {
        events.push({
          date: acc.last_call_visit_date,
          title: "Customer Contacted",
          desc: `Via ${acc.status_call_visit === "Meet" ? "In-Person Visit" : "Phone Call"}. ${acc.remarks || ""}`,
          account: acc.account_number,
          type: "contact",
        });
      }
      if (acc.expected_date || acc.meet_expected_date) {
        events.push({
          date: acc.meet_expected_date || acc.expected_date || "",
          title: "Promise to Pay / Expected Resolution",
          desc: acc.possible_solution || "Resolution expected.",
          account: acc.account_number,
          type: "promise",
        });
      }
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCustomer]);

  return (
    <div className="flex h-full bg-background overflow-hidden relative">
      {/* Left Panel: Search & List */}
      <div className="w-[400px] xl:w-[450px] shrink-0 border-r border-border/60 flex flex-col bg-gradient-to-b from-blue-50/50 to-background dark:from-blue-950/20 dark:to-background z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-headline">
              Customer 360
            </h1>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-300"></div>
            <div className="relative flex items-center bg-card dark:bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-1 shadow-sm">
              <div className="pl-3 pr-2">
                <Search className="w-5 h-5 text-blue-500" />
              </div>
              <input
                type="text"
                placeholder="Search name or CID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none py-2.5 text-sm font-medium text-foreground focus:outline-none placeholder:text-muted-foreground/50"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="pr-3 pl-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 space-y-4">
          {customers.map((c, idx) => {
            const initials = c.name.split(' ').map(n => n[0]).join('').substring(0,2);
            const isHighRisk = c.maxDpd >= 60;
            const isMediumRisk = c.maxDpd >= 30 && c.maxDpd < 60;
            const isSelected = selectedCid === c.cid;
            
            return (
              <motion.div
                key={c.cid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, ease: "easeOut" }}
                onClick={() => setSelectedCid(c.cid)}
                className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                  isSelected 
                    ? "border-blue-500 shadow-md ring-1 ring-blue-500/50" 
                    : "border-border/60 hover:border-blue-400/60 shadow-sm hover:shadow-md"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                )}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-inner border ${
                      isSelected 
                        ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800"
                        : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-300 border-border"
                    }`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold transition-colors ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-foreground group-hover:text-blue-600"}`}>
                        {c.name}
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground">{c.cid}</p>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    isHighRisk ? "bg-rose-50 text-rose-600 border border-rose-200" :
                    isMediumRisk ? "bg-amber-50 text-amber-600 border border-amber-200" :
                    "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  }`}>
                    {c.maxDpd > 0 ? `${c.maxDpd} DPD` : "Current"}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Exposure</p>
                    <p className="text-xs font-bold font-mono text-foreground">${c.totalExposure.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Products</p>
                    <p className="text-xs font-bold text-foreground">{c.accounts.length}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {customers.length === 0 && (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-bold text-foreground">No customers found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Dashboard Details */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
        <AnimatePresence mode="wait">
          {!selectedCustomer ? (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-900/30">
                <UserCircle className="w-12 h-12 text-blue-500/50" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Select a Customer</h2>
              <p className="text-muted-foreground max-w-md">
                Search and select a customer from the left panel to view their complete 360° profile, including aggregate exposure, behavioral intelligence, and interaction history.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedCustomer.cid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-y-auto custom-scrollbar flex flex-col"
            >
              {/* Header Sticky Bar */}
              <div className="sticky top-0 z-20 bg-card/90 backdrop-blur-md border-b border-border px-8 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-foreground leading-tight">{selectedCustomer.name}</h2>
                    <p className="text-sm font-mono text-muted-foreground leading-tight">{selectedCustomer.cid}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-muted rounded-lg text-xs font-bold text-muted-foreground border border-border flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Aggregate Grade: {selectedCustomer.worstGrade}
                  </span>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Generate 360 Report
                  </button>
                </div>
              </div>

              <div className="p-8 max-w-7xl mx-auto w-full grid grid-cols-12 gap-8 flex-1">
                
                {/* Left Column: Summary & Portfolio */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                  
                  {/* Aggregate Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-colors flex flex-col justify-center">
                      <div className="absolute top-2 -right-2 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Wallet className="w-12 h-12" /></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 relative z-10">Total Exposure</p>
                      <p className="text-xl font-bold font-mono tracking-tight text-foreground relative z-10 truncate">${selectedCustomer.totalExposure.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 relative z-10 truncate">Across {selectedCustomer.accounts.length} products</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-rose-500/30 transition-colors flex flex-col justify-center">
                      <div className="absolute top-2 -right-2 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><AlertOctagon className="w-12 h-12 text-rose-500" /></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 relative z-10">Total Overdue</p>
                      <p className="text-xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400 relative z-10 truncate">${selectedCustomer.totalOverdue.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 relative z-10 truncate">Immediate collection target</p>
                    </div>
                    <div className={`bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group transition-colors flex flex-col justify-center ${
                      selectedCustomer.maxDpd >= 60 ? "border-rose-200 bg-rose-50/50 hover:border-rose-400" :
                      selectedCustomer.maxDpd >= 30 ? "border-amber-200 bg-amber-50/50 hover:border-amber-400" :
                      "border-border hover:border-emerald-400"
                    }`}>
                      <div className="absolute top-2 -right-2 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Activity className={`w-12 h-12 ${selectedCustomer.maxDpd >= 60 ? 'text-rose-500' : selectedCustomer.maxDpd >= 30 ? 'text-amber-500' : 'text-emerald-500'}`} /></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 relative z-10">Highest DPD</p>
                      <p className={`text-xl font-bold font-mono tracking-tight relative z-10 truncate ${
                        selectedCustomer.maxDpd >= 60 ? "text-rose-600" :
                        selectedCustomer.maxDpd >= 30 ? "text-amber-600" : "text-foreground"
                      }`}>{selectedCustomer.maxDpd} Days</p>
                      <p className="text-[10px] text-muted-foreground mt-2 relative z-10 truncate">Worst performing account</p>
                    </div>
                  </div>

                  {/* Customer Intelligence & Contact Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Demographics & Contact */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-blue-500" />
                        Contact Profile
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary Phone</p>
                            <p className="text-sm font-medium text-foreground">+1 (555) 019-2834</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</p>
                            <p className="text-sm font-medium text-foreground">{selectedCustomer.name.split(' ')[0].toLowerCase()}@example.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mailing Address</p>
                            <p className="text-sm font-medium text-foreground">1234 Financial Blvd, Suite 100<br/>New York, NY 10004</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Behavioral Intelligence */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm bg-gradient-to-br from-indigo-50/30 to-background dark:from-indigo-950/20">
                      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-indigo-500" />
                        Behavioral Intelligence
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                          <span className="text-sm font-medium text-muted-foreground">Probability of Default (PD)</span>
                          <span className={`text-sm font-bold ${selectedCustomer.maxDpd >= 60 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {selectedCustomer.maxDpd >= 60 ? 'High (85%)' : selectedCustomer.maxDpd >= 30 ? 'Medium (45%)' : 'Low (12%)'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                          <span className="text-sm font-medium text-muted-foreground">Willingness to Pay Score</span>
                          <span className="text-sm font-bold text-amber-600">6.4 / 10</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                          <span className="text-sm font-medium text-muted-foreground">Best Time to Call</span>
                          <span className="text-sm font-bold text-foreground">Afternoon (2PM - 5PM)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">Preferred Channel</span>
                          <span className="text-sm font-bold text-foreground">SMS / Text</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Portfolio */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                      Product Portfolio
                    </h3>
                    <div className="space-y-4">
                      {selectedCustomer.accounts.map((acc, idx) => (
                        <motion.div
                          key={acc.account_number}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between group hover:border-blue-500/50 transition-colors shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                              (acc.past_due || 0) > 0 ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/30 dark:border-rose-800" : "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800"
                            }`}>
                              {getProductIcon(acc.loan_class)}
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                                {acc.loan_class}
                                {(acc.past_due || 0) > 0 && (
                                  <span className="px-2 py-0.5 bg-rose-50 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider rounded border border-rose-200 dark:border-rose-800">
                                    Delinquent
                                  </span>
                                )}
                              </h4>
                              <p className="text-xs font-mono text-muted-foreground mt-0.5">{acc.account_number} • {acc.branch_code}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Balance</p>
                              <p className="text-sm font-semibold font-mono text-foreground">${(acc.usd_equivalent || 0).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Overdue</p>
                              <p className={`text-sm font-semibold font-mono ${(acc.ovrdue_pr || 0) > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                                ${(acc.ovrdue_pr || 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right w-16">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">DPD</p>
                              <p className={`text-sm font-semibold font-mono ${(acc.past_due || 0) > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                                {acc.past_due || 0}
                              </p>
                            </div>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column: History Timeline */}
                <div className="col-span-12 lg:col-span-4">
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col sticky top-28">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 shrink-0">
                      <Activity className="w-5 h-5 text-emerald-500" />
                      Consolidated History
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4 max-h-[600px]">
                      {timelineEvents.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-sm text-muted-foreground">No recent interactions recorded.</p>
                        </div>
                      ) : (
                        <div className="relative border-l-2 border-border/60 ml-3 space-y-8 pb-8">
                          {timelineEvents.map((ev, i) => (
                            <div key={i} className="relative pl-6">
                              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-card ${
                                ev.type === 'promise' ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />
                              
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{ev.date}</p>
                              <div className="bg-muted/40 border border-border rounded-xl p-3 mt-1 shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="text-sm font-bold text-foreground">{ev.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ev.desc}</p>
                                <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-[10px] font-mono text-muted-foreground">{ev.account}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
