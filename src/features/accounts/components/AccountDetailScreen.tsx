import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Phone,
  CalendarClock,
  Terminal,
  Send,
  CreditCard,
  AlertTriangle,
  FileText,
  User,
  CheckCircle2,
  Navigation,
  MapPin,
  Lock,
  ChevronLeft,
} from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { AccountActivity } from "@/types";
import { SiteVisitDrawer } from "@/features/site-visits/components/SiteVisitDrawer";

/*
 * -------------------------------------------------------------
 * REMIX INTEGRATION / DATABASE MODEL (MOCK Implementation)
 * -------------------------------------------------------------
 * In a real Remix app at /routes/delinquent.accounts.$id.tsx:
 *
 * import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
 * import { useLoaderData, useFetcher } from "@remix-run/react";
 * import { db } from "~/utils/db.server";
 *
 * export async function loader({ params }: LoaderFunctionArgs) {
 *   const account = await db.account.findUnique({
 *     where: { id: params.id },
 *     include: {
 *       activities: { orderBy: { timestamp: 'desc' } },
 *       activePaymentPlans: true
 *     }
 *   });
 *   return json({ account });
 * }
 *
 * export async function action({ request, params }: ActionFunctionArgs) {
 *   const formData = await request.formData();
 *   const outcome = formData.get("outcome");
 *   const notes = formData.get("notes");
 *
 *   await db.activity.create({
 *     data: {
 *       accountId: params.id,
 *       type: 'CALL',
 *       outcome: String(outcome),
 *       notes: String(notes),
 *       agentName: 'Current User'
 *     }
 *   });
 *   return json({ success: true });
 * }
 * -------------------------------------------------------------
 */

// Mock Data
const MOCK_ACCOUNT = {
  id: "AC-1029-432",
  customerName: "Marcus Holden",
  cid: "CID-847291",
  bucket: "Mid-Stage",
  totalBalance: 14250.0,
  proRate: 15.4,
  dpd: 45,
  paymentPlans: [
    { id: "1", amount: 2500, dueDate: "2026-06-15", status: "Active" },
  ],
};

const INITIAL_ACTIVITIES: AccountActivity[] = [
  {
    id: "act-1",
    type: "CALL",
    timestamp: "2026-05-27T08:15:00Z",
    agentName: "Sarah Jenkins",
    outcome: "Left Voicemail",
    notes:
      "Called secondary number, went straight to voicemail. Left standard notification.",
  },
  {
    id: "act-2",
    type: "PTP",
    timestamp: "2026-05-25T14:30:00Z",
    agentName: "Mark R.",
    amount: 2500,
    dueDate: "2026-06-15",
    notes:
      "Customer agreed to partial settlement payment. Sent payment link via SMS.",
  },
  {
    id: "act-3",
    type: "SYSTEM",
    timestamp: "2026-05-20T00:00:00Z",
    notes:
      "System automatically shifted account to Mid-Stage Delinquency (DPD > 30)",
  },
  {
    id: "act-4",
    type: "CALL",
    timestamp: "2026-05-18T11:00:00Z",
    agentName: "Sarah Jenkins",
    outcome: "Contacted",
    notes:
      "Spoke with customer, claimed hardship due to medical bills. Need to follow up next week.",
  },
];

export default function AccountDetailScreen({
  onBack,
  accountData,
}: {
  onBack?: () => void;
  accountData?: any;
}) {
  const account = accountData
    ? {
        id: accountData.account_number || MOCK_ACCOUNT.id,
        customerName:
          accountData.customer_name ||
          accountData.customerName ||
          MOCK_ACCOUNT.customerName,
        cid: accountData.cid || MOCK_ACCOUNT.cid,
        bucket: accountData.bucket || MOCK_ACCOUNT.bucket,
        totalBalance:
          accountData.total_balance ||
          accountData.totalBalance ||
          MOCK_ACCOUNT.totalBalance,
        proRate:
          accountData.pro_rate || accountData.proRate || MOCK_ACCOUNT.proRate,
        dpd: accountData.dpd || MOCK_ACCOUNT.dpd,
        paymentPlans: MOCK_ACCOUNT.paymentPlans,
      }
    : MOCK_ACCOUNT;

  const [activities, setActivities] =
    useState<AccountActivity[]>(INITIAL_ACTIVITIES);

  // Action Form State
  const [channel, setChannel] = useState("Call");
  const [outcome, setOutcome] = useState("Contacted");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Site Visit Flow State
  const [isSiteVisitDrawerOpen, setIsSiteVisitDrawerOpen] = useState(false);
  const [siteVisitData, setSiteVisitData] = useState<any>(null);

  // Open drawer automatically when Site Visit is selected and no data is saved yet
  useEffect(() => {
    if (channel === "Site Visit" && !siteVisitData) {
      setIsSiteVisitDrawerOpen(true);
    }
  }, [channel, siteVisitData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setIsSubmitting(true);

    // Simulate network delay for UI feedback
    setTimeout(() => {
      const newActivity: AccountActivity = {
        id: `act-${Date.now()}`,
        type: "CALL",
        timestamp: new Date().toISOString(),
        agentName: "Current Agent",
        outcome,
        notes,
      };

      setActivities([newActivity, ...activities]);
      setNotes("");
      setIsSubmitting(false);
    }, 400);
  };

  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case "Grace Period":
        return "bg-accent/10 border-accent/30 text-accent-dark";
      case "Early-Stage":
        return "bg-amber-500/10 border-amber-500/30 text-amber-700";
      case "Mid-Stage":
        return "bg-orange-500/10 border-orange-500/30 text-orange-700";
      case "Late-Stage":
        return "bg-rose-500/10 border-rose-500/30 text-rose-700";
      default:
        return "bg-muted  border-border  text-muted-foreground";
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full bg-card  relative overflow-hidden font-sans">
      {/* LEFT COLUMN: Financial Snapshot */}
      <div className="w-1/3 shrink-0 border-r border-border  bg-card  flex flex-col overflow-y-auto custom-scrollbar p-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-card  text-muted-foreground border border-border  hover:bg-muted  hover:text-foreground transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
          </button>
          <h2 className="text-xl font-headline font-bold text-foreground tracking-tight">
            Account Detail
          </h2>
        </div>

        {/* Profile Card */}
        <div className="bg-card  border border-border  rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                {account.customerName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground leading-tight">
                  {account.customerName}
                </h3>
                <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mt-0.5">
                  {account.cid}
                </p>
              </div>
            </div>
            <div
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getBucketColor(account.bucket)}`}
            >
              {account.bucket}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Total Balance
              </p>
              <p className="text-lg font-mono font-bold text-foreground">
                $
                {account.totalBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Interest Rate
              </p>
              <p className="text-lg font-mono font-bold text-foreground">
                {account.proRate}%
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                DPD
              </p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-mono font-bold text-orange-600">
                  {account.dpd}
                </p>
                <span className="text-xs text-orange-600/70 font-semibold">
                  Days Overdue
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Payment Plans */}
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mt-2 mb-4 border-b border-border  pb-2">
          Active Plans
        </h4>
        {account.paymentPlans.length > 0 ? (
          <div className="flex flex-col gap-3">
            {account.paymentPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500"></div>
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-0.5">
                    Promise to Pay
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-700/80">
                    Due {new Date(plan.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-emerald-700">
                    ${plan.amount.toLocaleString()}
                  </p>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-800 rounded text-[9px] font-bold uppercase tracking-widest">
                    {plan.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-border border-dashed rounded-xl opacity-60">
            <p className="text-xs font-medium text-muted-foreground">
              No active payment plans
            </p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Lightweight Activity Feed & Action Footer */}
      <div className="flex-1 flex flex-col bg-card  relative">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border  bg-card  backdrop-blur-sm z-10 shrink-0">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              history
            </span>
            Activity History Feed
          </h3>
        </div>

        {/* Feed Timeline */}
        <div className="flex-1 overflow-y-auto px-8 relative custom-scrollbar flex flex-col-reverse">
          <div className="absolute left-[47px] top-4 border-l-2 border-border border-dashed h-[calc(100%-80px)] z-0"></div>

          <div className="py-6 space-y-6">
            {activities.map((activity, index) => {
              const isLast = index === activities.length - 1;

              let Icon = Phone;
              let iconColor = "text-purple-600 bg-purple-100 border-purple-200";

              if (activity.type === "PTP") {
                Icon = CalendarClock;
                iconColor =
                  "text-emerald-600 bg-emerald-100 border-emerald-200";
              } else if (activity.type === "SYSTEM") {
                Icon = Terminal;
                iconColor = "text-muted-foreground bg-muted border-border";
              }

              return (
                <div
                  key={activity.id}
                  className="relative flex items-start gap-4 z-10"
                >
                  {/* Timeline Node */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 shadow-sm ${iconColor} mt-1`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content Block */}
                  <div className="flex-1 bg-card  border border-border  rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-border  transition-colors">
                    {/* Activity Type Header */}
                    <div className="flex justify-between items-baseline mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          {activity.type === "CALL"
                            ? "Call Logged"
                            : activity.type === "PTP"
                              ? "PTP Created"
                              : "System Event"}
                        </span>
                        {activity.outcome && (
                          <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                            {activity.outcome}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium tracking-wide whitespace-nowrap ml-4">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>

                    {/* Meta / Notes */}
                    <div className="text-sm font-medium text-muted-foreground leading-relaxed">
                      {activity.notes}
                    </div>

                    {/* Bottom Metadata */}
                    {(activity.agentName || activity.amount) && (
                      <div className="mt-3 flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-3 border-t border-border ">
                        {activity.agentName && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              person
                            </span>
                            {activity.agentName}
                          </span>
                        )}
                        {activity.amount && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CreditCard className="w-3.5 h-3.5" />$
                            {activity.amount.toLocaleString()} due{" "}
                            {new Date(activity.dueDate!).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="relative flex items-start gap-4 z-10 opacity-60 grayscale pb-20">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-card  border-border  mt-1">
                <div className="w-2 h-2 rounded-full bg-outline"></div>
              </div>
              <div className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Account Originated
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="shrink-0 bg-card  border-t border-border  p-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <form
            className="flex flex-col gap-3 max-w-4xl w-full mx-auto"
            onSubmit={handleSubmit}
          >
            <div className="flex gap-4 items-start">
              <div className="w-36 shrink-0">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1.5 ml-1">
                  Channel
                </label>
                  <CustomSelect
                    value={channel}
                    onChange={(val) => {
                      setChannel(val);
                      if (val !== "Site Visit") {
                        setSiteVisitData(null); // Clear data if changed
                      }
                    }}
                    options={["Call", "SMS", "Email", "Site Visit"]}
                    className="w-full h-10 text-xs justify-between shadow-sm"
                  />
              </div>

              <div className="w-40 shrink-0">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1.5 ml-1">
                  Outcome
                </label>
                  <CustomSelect
                    value={outcome}
                    onChange={setOutcome}
                    options={[
                      "Contacted",
                      "No Answer",
                      "Left Message",
                      "Broken Promise Follow-up",
                      "Refusal / Dispute",
                    ]}
                    className="w-full h-10 text-xs justify-between shadow-sm"
                  />
              </div>

              <div className="flex-1 relative">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1.5 ml-1">
                  Agent Notes
                </label>
                {channel === "Site Visit" && !siteVisitData ? (
                  <div className="absolute inset-0 top-6 bg-muted/50  backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg border border-border  border-dashed">
                    <button
                      type="button"
                      onClick={() => setIsSiteVisitDrawerOpen(true)}
                      className="px-4 py-2 bg-card  border border-indigo-200  text-indigo-600  text-xs font-bold rounded-md shadow-sm flex items-center gap-2 hover:bg-indigo-50  transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Complete Mandatory Site Visit Report
                    </button>
                  </div>
                ) : null}
                <textarea
                  name="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Summarize the interaction, agreements made, and next steps..."
                  className="w-full bg-card  border border-border  rounded-lg px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary resize-none shadow-sm h-[72px]"
                />
              </div>

              <div className="flex-shrink-0 pt-6">
                <button
                  type="submit"
                  disabled={
                    !notes.trim() ||
                    isSubmitting ||
                    (channel === "Site Visit" && !siteVisitData)
                  }
                  className="h-10 px-6 bg-on-surface text-surface rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-on-surface-variant transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin"></div>
                  ) : channel === "Site Visit" && !siteVisitData ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Log
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Site Visit Interceptor Drawer */}
      <SiteVisitDrawer
        isOpen={isSiteVisitDrawerOpen}
        onClose={() => {
          setIsSiteVisitDrawerOpen(false);
          // If they close without saving, we could revert the channel, or just keep it locked
          if (!siteVisitData) {
            setChannel("Call");
          }
        }}
        onSave={(data) => {
          setSiteVisitData(data);
          setIsSiteVisitDrawerOpen(false);
          // Auto-populate some notes as a convenience
          setNotes(
            `Site Visit on ${data.dateOfVisit} by ${data.participant}.\nBusiness: ${data.bizStatus}\nSolution: ${data.solutionStatus}`,
          );
        }}
        account={{
          cid: account.cid,
          customerName: account.customerName,
          totalBalance: account.totalBalance,
          dpd: account.dpd,
        }}
        currentUser="Current Agent"
      />
    </div>
  );
}
