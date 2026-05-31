import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutTemplate,
  Zap,
  CheckCircle2,
  Database,
  MessageSquareText,
} from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface AlertConfig {
  triggerRule: string;
  subject: string;
  headerText: string;
  bodyText: string;
  
  bmRmEnabled: boolean;
  bmRmFields: {
    totalCountOverdue: boolean;
    cumulativeBalanceAtRisk: boolean;
    branchDpdAverage: boolean;
    totalParPortfolio: boolean;
    highestSingleExposure: boolean;
  };

  roEnabled: boolean;
  roFields: {
    customerName: boolean;
    exactDpd: boolean;
    lastAgentNote: boolean;
    accountSegment: boolean;
    ptpStatus: boolean;
  };
}

const DEFAULT_CONFIG: AlertConfig = {
  triggerRule: "Event-Based (Immediate)",
  subject: "URGENT: Portfolio Risk Escalation Alert",
  headerText: "Portfolio Risk Escalation Alert",
  bodyText: "Team, please review the latest risk parameter summary below and action immediately.",
  
  bmRmEnabled: true,
  bmRmFields: {
    totalCountOverdue: true,
    cumulativeBalanceAtRisk: true,
    branchDpdAverage: true,
    totalParPortfolio: false,
    highestSingleExposure: false,
  },

  roEnabled: true,
  roFields: {
    customerName: true,
    exactDpd: true,
    lastAgentNote: true,
    accountSegment: false,
    ptpStatus: false,
  },
};

export default function TemplatesScreen() {
  const [config, setConfig] = useState<AlertConfig>(DEFAULT_CONFIG);
  const [previewMode, setPreviewMode] = useState<"BM/RM" | "RO">("BM/RM");
  const [isSaving, setIsSaving] = useState(false);

  const updateConfig = (updates: Partial<AlertConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const updateBmRmField = (field: keyof AlertConfig["bmRmFields"], value: boolean) => {
    setConfig({
      ...config,
      bmRmFields: { ...config.bmRmFields, [field]: value },
    });
  };

  const updateRoField = (field: keyof AlertConfig["roFields"], value: boolean) => {
    setConfig({
      ...config,
      roFields: { ...config.roFields, [field]: value },
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };

  // Mock data for the preview
  const mockDate = "MAY 31, 2026";
  const mockBmRm = {
    totalCountOverdue: "24",
    cumulativeBalanceAtRisk: "$142,500 HTG",
    branchDpdAverage: "42 Days",
    totalParPortfolio: "$3,150,000 HTG",
    highestSingleExposure: "$15,000 HTG",
  };
  const mockRoData = [
    { name: "John Doe", dpd: "45", note: "Promised to pay tomorrow", segment: "Retail", ptp: "Broken" },
    { name: "Acme Corp", dpd: "60", note: "Left voicemail", segment: "SME", ptp: "Pending" },
    { name: "Jane Smith", dpd: "31", note: "Will call back later", segment: "Retail", ptp: "None" },
  ];

  return (
    <div className="flex flex-col h-full bg-background font-sans overflow-hidden border-l border-border">
      {/* Top Navbar */}
      <div className="px-8 py-5 shrink-0 bg-card border-b border-border flex justify-between items-center z-20 shadow-sm relative">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <h1 className="text-[22px] font-black text-foreground tracking-tight font-headline">
              Templates & Dunning Configuration
            </h1>
          </div>
          <p className="text-muted-foreground text-xs font-medium pl-11">
            Configure internal portfolio risk alerts and automated email escalation rules.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-md flex items-center gap-2"
        >
          {isSaving ? "Deploying..." : "Deploy Alert Rules"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Configuration) */}
        <div className="w-[380px] shrink-0 bg-card border-r border-border flex flex-col z-10 overflow-y-auto custom-scrollbar shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] relative">
          
          {/* Trigger Rules */}
          <div className="p-6 border-b border-border">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-500" />
              Trigger Rules
            </h3>
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Escalation Trigger
              </label>
              <CustomSelect
                value={config.triggerRule}
                onChange={(v) => updateConfig({ triggerRule: v })}
                options={["Event-Based (Immediate)", "Daily Digest (EOD)", "Weekly Summary", "Manual Only"]}
                className="w-full h-10 shadow-sm"
              />
            </div>
          </div>

          {/* Email Customization */}
          <div className="p-6 border-b border-border bg-muted/30">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <MessageSquareText className="w-4 h-4 text-blue-500" />
              Email Customization
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={config.subject}
                  onChange={(e) => updateConfig({ subject: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 shadow-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Header Title
                </label>
                <input
                  type="text"
                  value={config.headerText}
                  onChange={(e) => updateConfig({ headerText: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 shadow-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Opening Message
                </label>
                <textarea
                  value={config.bodyText}
                  onChange={(e) => updateConfig({ bodyText: e.target.value })}
                  className="w-full px-3 py-2 min-h-[80px] bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 shadow-sm transition-colors resize-y"
                />
              </div>
            </div>
          </div>

          {/* Data Payload Config */}
          <div className="p-6 flex-1 bg-card">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-6">
              <Database className="w-4 h-4 text-green-500" />
              Data Payload
            </h3>

            {/* BM & RM Roles */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground">BM & RM Roles</h4>
                  <p className="text-[10px] text-muted-foreground">High-Level Parameter Summary</p>
                </div>
                {/* Toggle Switch */}
                <button
                  onClick={() => updateConfig({ bmRmEnabled: !config.bmRmEnabled })}
                  className={`w-9 h-5 rounded-full relative transition-colors ${config.bmRmEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all ${config.bmRmEnabled ? "left-[20px]" : "left-[3px]"}`} />
                </button>
              </div>

              <AnimatePresence>
                {config.bmRmEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                    {[
                      { key: "totalCountOverdue", label: "Total Count Overdue" },
                      { key: "cumulativeBalanceAtRisk", label: "Cumulative Balance at Risk" },
                      { key: "branchDpdAverage", label: "Branch DPD Average" },
                      { key: "totalParPortfolio", label: "Total PAR Portfolio" },
                      { key: "highestSingleExposure", label: "Highest Single Exposure" },
                    ].map((item) => (
                      <label key={item.key} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${config.bmRmFields[item.key as keyof AlertConfig["bmRmFields"]] ? "border-primary/30 bg-primary/10" : "border-transparent hover:bg-muted"}`}>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={config.bmRmFields[item.key as keyof AlertConfig["bmRmFields"]]}
                          onChange={(e) => updateBmRmField(item.key as keyof AlertConfig["bmRmFields"], e.target.checked)}
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${config.bmRmFields[item.key as keyof AlertConfig["bmRmFields"]] ? "bg-primary border-primary" : "border-input bg-background"}`}>
                          {config.bmRmFields[item.key as keyof AlertConfig["bmRmFields"]] && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className={`text-xs font-bold ${config.bmRmFields[item.key as keyof AlertConfig["bmRmFields"]] ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RO Roles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground">RO Roles</h4>
                  <p className="text-[10px] text-muted-foreground">Atomic-Level Detailed Ledger</p>
                </div>
                <button
                  onClick={() => updateConfig({ roEnabled: !config.roEnabled })}
                  className={`w-9 h-5 rounded-full relative transition-colors ${config.roEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all ${config.roEnabled ? "left-[20px]" : "left-[3px]"}`} />
                </button>
              </div>

              <AnimatePresence>
                {config.roEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                    {[
                      { key: "customerName", label: "Customer Name" },
                      { key: "exactDpd", label: "Exact DPD" },
                      { key: "lastAgentNote", label: "Last Agent Note" },
                      { key: "accountSegment", label: "Account Segment" },
                      { key: "ptpStatus", label: "PTP Status" },
                    ].map((item) => (
                      <label key={item.key} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${config.roFields[item.key as keyof AlertConfig["roFields"]] ? "border-primary/30 bg-primary/10" : "border-transparent hover:bg-muted"}`}>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={config.roFields[item.key as keyof AlertConfig["roFields"]]}
                          onChange={(e) => updateRoField(item.key as keyof AlertConfig["roFields"], e.target.checked)}
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${config.roFields[item.key as keyof AlertConfig["roFields"]] ? "bg-primary border-primary" : "border-input bg-background"}`}>
                          {config.roFields[item.key as keyof AlertConfig["roFields"]] && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className={`text-xs font-bold ${config.roFields[item.key as keyof AlertConfig["roFields"]] ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Main Stage: Secure Mail Viewer (Right) */}
        <div className="flex-1 relative pt-8 px-8 overflow-y-auto custom-scrollbar bg-background">
          {/* Top Toggle */}
          <div className="flex items-center justify-center gap-0 mb-8 bg-card border border-border rounded-full p-1 shadow-sm relative z-20 mx-auto w-max">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4">Preview Mode:</span>
            <button
              onClick={() => setPreviewMode("BM/RM")}
              className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${previewMode === "BM/RM" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
            >
              View As BM/RM
            </button>
            <button
              onClick={() => setPreviewMode("RO")}
              className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${previewMode === "RO" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
            >
              View As RO
            </button>
          </div>

          {/* Mail Viewer Window */}
          <div className="w-full max-w-[850px] mx-auto bg-card border border-border shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden mb-12 flex flex-col">
            
            {/* Window Header */}
            <div className="bg-muted/50 px-6 py-3 border-b border-border flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Secure Mail Viewer
              </div>
              <div className="w-12"></div> {/* Spacer for center alignment */}
            </div>

            {/* Email Content */}
            <div className="p-12 flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-8 font-headline">
                {config.subject || "No Subject"}
              </h1>

              {/* Sender Info */}
              <div className="flex items-center justify-between bg-muted/30 border border-border rounded-xl p-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    MD
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">MDCS Escalation Engine</div>
                    <div className="text-[11px] text-muted-foreground">To: {previewMode === "BM/RM" ? "manager_east@bank.com" : "ro_east@bank.com"}</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {mockDate}
                </div>
              </div>

              {/* Body Text */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-10 whitespace-pre-wrap">
                {config.bodyText}
              </p>

              {/* Data Table */}
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                
                {previewMode === "BM/RM" ? (
                  /* BM/RM Summary View */
                  <>
                    <div className="bg-muted/50 px-6 py-3 flex justify-between items-center border-b border-border">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground">
                        Parameter Summary
                      </h3>
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Auto-Generated
                      </span>
                    </div>
                    {config.bmRmEnabled ? (
                      <div className="p-8 grid grid-cols-2 gap-y-8 gap-x-12">
                        {config.bmRmFields.totalCountOverdue && (
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Count Overdue</div>
                            <div className="text-2xl font-bold text-foreground">{mockBmRm.totalCountOverdue}</div>
                          </div>
                        )}
                        {config.bmRmFields.cumulativeBalanceAtRisk && (
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Cumulative Balance At Risk</div>
                            <div className="text-2xl font-bold text-red-500">{mockBmRm.cumulativeBalanceAtRisk}</div>
                          </div>
                        )}
                        {config.bmRmFields.branchDpdAverage && (
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Branch DPD Average</div>
                            <div className="text-2xl font-bold text-amber-500">{mockBmRm.branchDpdAverage}</div>
                          </div>
                        )}
                        {config.bmRmFields.totalParPortfolio && (
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Total PAR Portfolio</div>
                            <div className="text-2xl font-bold text-foreground">{mockBmRm.totalParPortfolio}</div>
                          </div>
                        )}
                        {config.bmRmFields.highestSingleExposure && (
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Highest Single Exposure</div>
                            <div className="text-2xl font-bold text-rose-500">{mockBmRm.highestSingleExposure}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-sm text-muted-foreground italic">
                        BM & RM Roles data payload is currently disabled.
                      </div>
                    )}
                    
                    {/* Disclaimer */}
                    <div className="bg-muted/30 border-t border-border border-dashed p-4 text-center">
                      <p className="text-[10px] text-muted-foreground">
                        Detailed client rows are hidden for this role. Only the macro summary is visible.<br/>
                        Consult your frontline RO for granular details.
                      </p>
                    </div>
                  </>
                ) : (
                  /* RO Detailed View */
                  <>
                    <div className="bg-muted/50 px-6 py-3 flex justify-between items-center border-b border-border">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground">
                        Detailed Ledger (Action Required)
                      </h3>
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">
                        Action Required
                      </span>
                    </div>
                    {config.roEnabled ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="bg-card border-b border-border">
                              {config.roFields.customerName && <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer Name</th>}
                              {config.roFields.exactDpd && <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Exact DPD</th>}
                              {config.roFields.accountSegment && <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Segment</th>}
                              {config.roFields.ptpStatus && <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">PTP Status</th>}
                              {config.roFields.lastAgentNote && <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Note</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {mockRoData.map((row, i) => (
                              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50">
                                {config.roFields.customerName && <td className="p-4 font-bold text-foreground">{row.name}</td>}
                                {config.roFields.exactDpd && <td className="p-4 text-red-500 font-bold">{row.dpd} Days</td>}
                                {config.roFields.accountSegment && <td className="p-4 text-muted-foreground">{row.segment}</td>}
                                {config.roFields.ptpStatus && (
                                  <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${row.ptp === 'Broken' ? 'bg-red-500/10 text-red-500' : row.ptp === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                                      {row.ptp}
                                    </span>
                                  </td>
                                )}
                                {config.roFields.lastAgentNote && <td className="p-4 text-muted-foreground text-xs">{row.note}</td>}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-sm text-muted-foreground italic">
                        RO Roles data payload is currently disabled.
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* Email Footer Disclaimer */}
              <div className="mt-12 text-center text-[9px] text-muted-foreground uppercase tracking-widest">
                Automated Message from Central Collections System (MDCS)<br/>
                Do not reply directly to this email.
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
