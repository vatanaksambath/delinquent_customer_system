import React, { useState } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Download,
  Filter,
  Activity,
  Settings,
  User,
  Server,
  Calendar,
  Hash,
  X,
} from "lucide-react";
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorType: "user" | "system";
  actionType: string;
  category: "Data Access" | "State Change" | "Communication" | "System Config";
  severity: "Info" | "Warning" | "Critical";
  targetEntity: string;
  sourceIp: string;
  metadata: { userAgent: string; sessionId: string; [key: string]: unknown };
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
}
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "ADT-9921-A",
    timestamp: "2026-05-27 08:14:22",
    actorId: "U-1049",
    actorName: "Sarah Jenkins",
    actorType: "user",
    actionType: "UPDATE_DPD_RULE",
    category: "System Config",
    severity: "Critical",
    targetEntity: "Rule #402 (High Risk)",
    sourceIp: "192.168.1.45",
    metadata: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/114.0.0.0",
      sessionId: "ses_8f92j1k2l3m4n5",
    },
    previousState: { threshold: 90, action: "Legal Notice" },
    newState: { threshold: 75, action: "Legal Notice" },
  },
  {
    id: "ADT-9922-B",
    timestamp: "2026-05-27 08:30:11",
    actorId: "SYS-CORE",
    actorName: "System Workflow",
    actorType: "system",
    actionType: "SEND_DUNNING_NOTICE",
    category: "Communication",
    severity: "Info",
    targetEntity: "AC-1092-481",
    sourceIp: "Internal (10.0.0.12)",
    metadata: {
      userAgent: "MDCS_Automated_Worker/2.0",
      sessionId: "sys_batch_054",
      channel: "SMS",
      templateId: "TMP-02",
    },
  },
  {
    id: "ADT-9923-C",
    timestamp: "2026-05-27 09:05:44",
    actorId: "U-2091",
    actorName: "Marcus Holden",
    actorType: "user",
    actionType: "VIEW_CUSTOMER_PII",
    category: "Data Access",
    severity: "Info",
    targetEntity: "C-7731-892",
    sourceIp: "192.168.1.112",
    metadata: {
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
      sessionId: "ses_4q3w2e1r",
      fieldsAccessed: ["SSN", "Phone Number", "Home Address"],
    },
  },
  {
    id: "ADT-9924-D",
    timestamp: "2026-05-27 09:12:05",
    actorId: "U-1049",
    actorName: "Sarah Jenkins",
    actorType: "user",
    actionType: "OVERRIDE_PAYMENT_STATUS",
    category: "State Change",
    severity: "Warning",
    targetEntity: "AC-4041-892",
    sourceIp: "192.168.1.45",
    metadata: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/114.0.0.0",
      sessionId: "ses_8f92j1k2l3m4n5",
      reason: "Manual wire transfer verified by finance team.",
    },
    previousState: { status: "Delinquent", dpd: 45 },
    newState: { status: "Current", dpd: 0 },
  },
]; // Helper to render JSON blocks with simple diff highlighting const JsonDiffViewer = ({ prev, next }: { prev?: Record<string, unknown>, next?: Record<string, unknown> }) => { if (!prev && !next) return <div className="text-muted-foreground italic p-4 text-xs font-mono">No state changes recorded.</div>; return ( <div className="font-mono text-xs p-4 bg-background text-slate-300 rounded-lg overflow-x-auto"> {prev && ( <div className="mb-4"> <div className="text-red-400 mb-1 font-bold text-[10px] uppercase tracking-wider">- Previous State</div> <pre className="text-red-300/80 pl-2 border-l-2 border-red-500/50"> {JSON.stringify(prev, null, 2)} </pre> </div> )} {next && ( <div> <div className="text-green-400 mb-1 font-bold text-[10px] uppercase tracking-wider">+ New State</div> <pre className="text-green-300/80 pl-2 border-l-2 border-green-500/50"> {JSON.stringify(next, null, 2)} </pre> </div> )} </div> ); }; export default function AuditLogsScreen() { const [searchTerm, setSearchTerm] = useState(''); const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null); const [dateRange, setDateRange] = useState('Last 24 Hours'); const [categoryFilter, setCategoryFilter] = useState('All Categories'); const [severityFilter, setSeverityFilter] = useState('All Severities'); const getSeverityStyle = (severity: string) => { switch(severity) { case 'Info': return 'bg-muted text-muted-foreground border-border'; case 'Warning': return 'bg-amber-50 text-amber-600 border-amber-200 '; case 'Critical': return 'bg-red-50 text-red-600 border-red-200 '; default: return 'bg-muted text-muted-foreground'; } }; const getActorIcon = (type: string) => { return type === 'system' ? <Server className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />; }; return ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full bg-background overflow-hidden font-sans relative" > <div className="px-8 pt-8 pb-4 shrink-0 bg-card border-b border-border z-10"> <div className="flex justify-between items-start mb-6"> <div> <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Audit & Compliance Logs</h1> <p className="text-muted-foreground text-sm">Immutable ledger tracking automated triggers, data access, and configuration changes.</p> </div> <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-background rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm cursor-pointer"> <Download className="w-4 h-4" /> Export for Audit </button> </div> {/* Control Center & Compliance Filters */} <div className="flex flex-wrap items-center gap-4"> <div className="relative flex-1 min-w-[280px]"> <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" /> <input type="text" placeholder="Search Event Hash, Customer ID, or Agent ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-muted border border-border rounded-lg text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 transition-shadow" /> </div> <div className="flex items-center gap-2 border-l border-border pl-4"> <Filter className="w-4 h-4 text-muted-foreground" /> <CustomSelect value={dateRange} onChange={setDateRange} options={["Last 24 Hours", "Last 7 Days", "Last 30 Days", "Custom Range"]} className="h-9 shadow-sm" /> <CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={["All Categories", "Data Access", "State Change", "Communication", "System Config"]} className="h-9 shadow-sm" /> <CustomSelect value={severityFilter} onChange={setSeverityFilter} options={["All Severities", "Info (Routine)", "Warning (Risk)", "Critical (System)"]} className="h-9 shadow-sm" /> </div> </div> </div> {/* High-Density Immutable Ledger */} <div className="flex-1 overflow-y-auto custom-scrollbar p-6"> <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"> <table className="w-full text-left border-collapse whitespace-nowrap"> <thead className="bg-muted/80 sticky top-0 border-b border-border shadow-sm z-10"> <tr> <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timestamp</th> <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Severity</th> <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actor</th> <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Event Action</th> <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Entity</th> <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">IP Source</th> </tr> </thead> <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50"> {mockAuditLogs.map((log) => ( <tr key={log.id} onClick={() => setSelectedLog(log)} className="hover:bg-accent/40 transition-colors cursor-pointer group" > <td className="py-3 px-4 text-xs text-muted-foreground font-mono tracking-tight">{log.timestamp}</td> <td className="py-3 px-4"> <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getSeverityStyle(log.severity)}`}> {log.severity} </span> </td> <td className="py-3 px-4"> <div className="flex items-center gap-2"> <div className="p-1 rounded bg-muted text-muted-foreground"> {getActorIcon(log.actorType)} </div> <div> <div className="text-xs font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{log.actorName}</div> <div className="text-[10px] text-muted-foreground font-mono">{log.actorId}</div> </div> </div> </td> <td className="py-3 px-4"> <span className="text-xs font-bold text-card-foreground "> {log.actionType} </span> </td> <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{log.targetEntity}</td> <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{log.sourceIp}</td> </tr> ))} </tbody> </table> </div> </div> {/* Deep-Dive JSON Diff Drawer */} <AnimatePresence> {selectedLog && ( <> <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLog(null)} className="absolute inset-0 bg-foreground/20 backdrop-blur-sm z-20" /> <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute right-0 top-0 h-full w-full max-w-2xl bg-card shadow-2xl z-30 border-l border-border flex flex-col" > <div className="flex items-center justify-between p-6 border-b border-border shrink-0"> <div> <div className="flex items-center gap-3 mb-1"> <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getSeverityStyle(selectedLog.severity)}`}> {selectedLog.severity} </span> <span className="text-[10px] font-mono text-muted-foreground">ID: {selectedLog.id}</span> </div> <h2 className="text-xl font-bold text-foreground">{selectedLog.actionType}</h2> <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mt-1"> <Calendar className="w-3.5 h-3.5" /> {selectedLog.timestamp} </div> </div> <button onClick={() => setSelectedLog(null)} className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors" > <X className="w-5 h-5" /> </button> </div> <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar"> {/* Context Overview */} <div className="grid grid-cols-2 gap-4"> <div className="p-4 rounded-xl border border-border bg-muted/50"> <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Actor Information</div> <div className="font-bold text-foreground flex items-center gap-2"> {getActorIcon(selectedLog.actorType)} {selectedLog.actorName} </div> <div className="text-xs font-mono text-muted-foreground mt-1">{selectedLog.actorId}</div> </div> <div className="p-4 rounded-xl border border-border bg-muted/50"> <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Target Entity</div> <div className="font-bold font-mono text-foreground">{selectedLog.targetEntity}</div> <div className="text-xs text-muted-foreground mt-1">{selectedLog.category}</div> </div> </div> {/* Raw Metadata */} <div> <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2"> <Hash className="w-4 h-4 text-muted-foreground" /> Session Metadata </h3> <div className="bg-card border border-border rounded-xl overflow-hidden text-xs"> <table className="w-full text-left"> <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50"> <tr> <th className="py-2.5 px-4 font-medium text-muted-foreground w-1/3 bg-muted/50">Source IP</th> <td className="py-2.5 px-4 font-mono text-card-foreground">{selectedLog.sourceIp}</td> </tr> {Object.entries(selectedLog.metadata).map(([key, value]) => ( <tr key={key}> <th className="py-2.5 px-4 font-medium text-muted-foreground w-1/3 bg-muted/50 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</th> <td className="py-2.5 px-4 font-mono text-card-foreground"> {typeof value === 'object' ? JSON.stringify(value) : String(value)} </td> </tr> ))} </tbody> </table> </div> </div> {/* State Changes Diff block */} <div> <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2"> <Activity className="w-4 h-4 text-muted-foreground" /> State Payload Diff </h3> <div className="rounded-xl overflow-hidden shadow-sm border border-border bg-background"> <div className="flex items-center gap-2 p-2 bg-foreground border-b border-border"> <div className="flex gap-1.5 pl-2"> <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div> <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div> <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div> </div> <div className="text-[10px] font-mono text-muted-foreground ml-2">JSON Representation</div> </div> <JsonDiffViewer prev={selectedLog.previousState} next={selectedLog.newState} /> </div> </div> </div> </motion.div> </> )} </AnimatePresence> </motion.div> ); }
