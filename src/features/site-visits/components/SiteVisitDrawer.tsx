import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  User,
  MapPin,
  Building,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Save,
  Trash2,
  Calendar,
  FileText,
} from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

const siteVisitSchema = z
  .object({
    dateOfVisit: z.string().min(1, "Date is required"),
    participant: z.string().min(1, "Participant is required"),
    npldParticipation: z.boolean(),
    npldName: z.string().optional(),
    bizStatus: z.string().min(1, "Status of Business Operation is required"),
    borrowerStatus: z.string().min(1, "Status of Borrower is required"),
    collateralPhysicalChange: z.boolean(),
    collateralPhysicalRemark: z.string().optional(),
    collateralOwnershipChange: z.boolean(),
    collateralOwnershipRemark: z.string().optional(),
    collateralPriceChange: z.boolean(),
    collateralPriceRemark: z.string().optional(),
    solutionStatus: z.string().optional(),
    abilityToResolve: z.string().min(1, "Ability to Resolve is required"),
    customerRequest: z.string().optional(),
    lroComment: z.string().optional(),
    nextAction: z.string().optional(),
    actionDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.npldParticipation && !data.npldName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "NPLD Name is required",
        path: ["npldName"],
      });
    }
    if (
      data.collateralPhysicalChange &&
      !data.collateralPhysicalRemark?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Remark is required",
        path: ["collateralPhysicalRemark"],
      });
    }
    if (
      data.collateralOwnershipChange &&
      !data.collateralOwnershipRemark?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Remark is required",
        path: ["collateralOwnershipRemark"],
      });
    }
    if (data.collateralPriceChange && !data.collateralPriceRemark?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Remark is required",
        path: ["collateralPriceRemark"],
      });
    }
    if (data.actionDate) {
      const selectedDate = new Date(data.actionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Action date must be in the future",
          path: ["actionDate"],
        });
      }
    }
  });

type SiteVisitFormValues = z.infer<typeof siteVisitSchema>;

export interface SiteVisitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SiteVisitFormValues) => void;
  account: {
    cid: string;
    customerName: string;
    totalBalance: number;
    dpd: number;
  };
  currentUser: string;
  initialData?: SiteVisitFormValues | null;
  initialView?: "FORM" | "TRACKER";
}

// Modern Switch Component
const Switch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={cn(
      "relative w-[42px] h-[24px] rounded-full transition-colors duration-300 ease-in-out shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 shadow-inner",
      checked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600",
    )}
  >
    <span
      className={cn(
        "absolute top-[2px] left-[2px] bg-white rounded-full transition-all duration-300 ease-out shadow-[0_2px_5px_rgba(0,0,0,0.2)]",
        checked ? "w-5 h-5 translate-x-[18px]" : "w-5 h-5 translate-x-0",
      )}
    />
  </button>
);

type ApprovalStatus = "PENDING_RM" | "APPROVED_RM" | "REJECTED_RM" | "PENDING_BM" | "APPROVED_BM" | "REJECTED_BM";

const SiteVisitTracker = ({ 
  status, 
  onSimulateAction 
}: { 
  status: ApprovalStatus; 
  onSimulateAction: (action: ApprovalStatus) => void 
}) => {
  const getCurrentTime = () => new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const steps = [
    { id: "submit", title: "Request Submitted", description: "Form completed & verified", active: true, completed: true },
    { 
      id: "rm", 
      title: "RM Approval", 
      description: status.includes("RM") 
        ? (status === "PENDING_RM" ? "Waiting for review" : 
           status === "APPROVED_RM" ? <span className="flex flex-col gap-0.5"><span>Approved by <span className="font-bold text-foreground">Robert Smith</span></span><span className="text-[10px] uppercase tracking-widest">{getCurrentTime()}</span></span> : 
           <span className="flex flex-col gap-0.5"><span>Rejected by <span className="font-bold text-foreground">Robert Smith</span></span><span className="text-[10px] uppercase tracking-widest">{getCurrentTime()}</span></span>) 
        : <span className="flex flex-col gap-0.5"><span>Approved by <span className="font-bold text-foreground">Robert Smith</span></span><span className="text-[10px] uppercase tracking-widest">Previous Step</span></span>, 
      active: status.includes("RM") || status.includes("BM"), 
      completed: status === "APPROVED_RM" || status.includes("BM"),
      rejected: status === "REJECTED_RM"
    },
    { 
      id: "bm", 
      title: "Branch Manager Approval", 
      description: status.includes("BM") 
        ? (status === "PENDING_BM" ? "Waiting for review" : 
           status === "APPROVED_BM" ? <span className="flex flex-col gap-0.5"><span>Approved by <span className="font-bold text-foreground">Michael Brown</span></span><span className="text-[10px] uppercase tracking-widest">{getCurrentTime()}</span></span> : 
           <span className="flex flex-col gap-0.5"><span>Rejected by <span className="font-bold text-foreground">Michael Brown</span></span><span className="text-[10px] uppercase tracking-widest">{getCurrentTime()}</span></span>) 
        : "Pending RM", 
      active: status.includes("BM"), 
      completed: status === "APPROVED_BM",
      rejected: status === "REJECTED_BM"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Request Status</h2>
          <p className="text-sm text-muted-foreground font-medium">Track the real-time progress of your Site Visit Request.</p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 py-10">
          <div className="relative pl-6">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex gap-6 relative">
                {/* Connecting line */}
                {idx !== steps.length - 1 && (
                  <div className={`absolute left-[15px] top-[30px] bottom-[-30px] w-0.5 rounded-full transition-colors duration-500 ${step.completed ? "bg-green-500" : step.rejected ? "bg-red-500" : "bg-border"}`} />
                )}
                
                {/* Step Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10 transition-colors duration-500 ${
                  step.completed ? "bg-green-500 text-white shadow-lg shadow-green-500/30" :
                  step.rejected ? "bg-red-500 text-white shadow-lg shadow-red-500/30" :
                  step.active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-4 ring-blue-600/20" :
                  "bg-muted text-muted-foreground border border-border"
                }`}>
                  {step.completed ? (
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  ) : step.rejected ? (
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  ) : step.active ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  )}
                </div>

                {/* Step Content */}
                <div className="pb-12 pt-1">
                  <h3 className={`text-base font-bold mb-1 transition-colors duration-500 ${
                    step.completed ? "text-foreground" :
                    step.rejected ? "text-red-600" :
                    step.active ? "text-blue-600" :
                    "text-muted-foreground"
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm font-medium ${
                    step.completed || step.active || step.rejected ? "text-muted-foreground" : "text-muted-foreground/50"
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Simulation Buttons */}
        <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">science</span>
            Simulation Panel
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={(e) => { e.preventDefault(); onSimulateAction("PENDING_RM"); }}
              className="px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
            >
              Reset
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); onSimulateAction("APPROVED_RM"); }}
              disabled={!status.includes("RM") || status === "REJECTED_RM"}
              className="px-4 py-2 bg-card border border-green-200 rounded-lg text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              Approve (RM)
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); onSimulateAction("REJECTED_RM"); }}
              disabled={!status.includes("RM") || status === "REJECTED_RM"}
              className="px-4 py-2 bg-card border border-red-200 rounded-lg text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              Reject (RM)
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); onSimulateAction("APPROVED_BM"); }}
              disabled={!status.includes("BM") || status === "REJECTED_BM"}
              className="px-4 py-2 bg-card border border-green-200 rounded-lg text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              Approve (BM)
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); onSimulateAction("REJECTED_BM"); }}
              disabled={!status.includes("BM") || status === "REJECTED_BM"}
              className="px-4 py-2 bg-card border border-red-200 rounded-lg text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              Reject (BM)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function SiteVisitDrawer({
  isOpen,
  onClose,
  onSave,
  account,
  currentUser,
  initialData,
  initialView = "FORM",
}: SiteVisitDrawerProps) {
  const [view, setView] = useState<"FORM" | "TRACKER">(initialView);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>("PENDING_RM");

  // Reset state when drawer opens or closes
  React.useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setApprovalStatus("PENDING_RM");
    } else {
      setTimeout(() => {
        setView("FORM");
        setApprovalStatus("PENDING_RM");
      }, 300);
    }
  }, [isOpen, initialView]);
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<SiteVisitFormValues>({
    resolver: zodResolver(siteVisitSchema),
    defaultValues: initialData || {
      dateOfVisit: new Date().toISOString().split("T")[0],
      participant: "RM",
      npldParticipation: false,
      npldName: "",
      bizStatus: "",
      borrowerStatus: "Married",
      collateralPhysicalChange: false,
      collateralPhysicalRemark: "",
      collateralOwnershipChange: false,
      collateralOwnershipRemark: "",
      collateralPriceChange: false,
      collateralPriceRemark: "",
      solutionStatus: "",
      abilityToResolve: "Restructure",
      customerRequest: "",
      lroComment: "",
      nextAction: "",
      actionDate: "",
    },
  });

  // Reset form when opened with new data
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        // Reset to defaults if no initialData
        reset({
          dateOfVisit: new Date().toISOString().split("T")[0],
          participant: "RM",
          npldParticipation: false,
          npldName: "",
          bizStatus: "",
          borrowerStatus: "Married",
          collateralPhysicalChange: false,
          collateralPhysicalRemark: "",
          collateralOwnershipChange: false,
          collateralOwnershipRemark: "",
          collateralPriceChange: false,
          collateralPriceRemark: "",
          solutionStatus: "",
          abilityToResolve: "Restructure",
          customerRequest: "",
          lroComment: "",
          nextAction: "",
          actionDate: "",
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const npldParticipation = watch("npldParticipation");
  const collateralPhysicalChange = watch("collateralPhysicalChange");
  const collateralOwnershipChange = watch("collateralOwnershipChange");
  const collateralPriceChange = watch("collateralPriceChange");

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = (data: SiteVisitFormValues) => {
    setIsSaving(true);
    // Simulate network delay
    setTimeout(() => {
      onSave(data);
      setIsSaving(false);
      setView("TRACKER");
      setApprovalStatus("PENDING_RM");
    }, 600);
  };

  const handleSimulateAction = (action: ApprovalStatus) => {
    setApprovalStatus(action);
    if (action === "APPROVED_RM") {
      // Simulate moving to pending BM after RM approves
      setTimeout(() => {
        setApprovalStatus("PENDING_BM");
      }, 800);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/15 dark:bg-slate-900/70 backdrop-blur-[8px] z-[120] transition-opacity"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="fixed inset-y-0 right-0 w-full max-w-4xl bg-slate-50/95 dark:bg-background/95 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.1)] z-[130] flex flex-col border-l border-white/20 dark:border-border font-sans"
          >
            {view === "FORM" ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 px-8 py-5 border-b border-border bg-background/95 backdrop-blur-md shrink-0 flex justify-between items-center shadow-sm">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                      Site-Visit Report:{" "}
                      <span className="font-normal text-muted-foreground ">
                        {account.customerName} ({account.cid})
                      </span>
                    </h2>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700    text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Draft
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete this mandatory report before proceeding. All fields
                    marked with * are required.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                <div className="max-w-3xl space-y-8 mx-auto pb-12">
                  {/* SECTION 1: Customer Information */}
                  <div className="bg-card  rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="bg-muted  px-6 py-4 border-b border-slate-100  flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100  flex items-center justify-center text-blue-600  shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                        Section I: Customer Information
                      </h3>
                    </div>
                    <div className="p-6">
                      {/* Read-Only Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-muted  p-3 rounded-lg border border-slate-100 ">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                            Customer CID
                          </div>
                          <div className="text-sm font-mono font-medium text-foreground">
                            {account.cid}
                          </div>
                        </div>
                        <div className="bg-muted  p-3 rounded-lg border border-slate-100 ">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                            Customer Name
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {account.customerName}
                          </div>
                        </div>
                        <div className="bg-muted  p-3 rounded-lg border border-slate-100 ">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                            Branch Name
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            Main Branch HQ
                          </div>
                        </div>
                        <div className="bg-muted  p-3 rounded-lg border border-slate-100 ">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                            Outstanding Amt
                          </div>
                          <div className="text-sm font-mono font-medium text-foreground">
                            ${account.totalBalance.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-muted  p-3 rounded-lg border border-slate-100 ">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                            Day Past Due
                          </div>
                          <div className="text-sm font-mono font-medium text-orange-600">
                            {account.dpd} Days
                          </div>
                        </div>
                        <div className="bg-muted  p-3 rounded-lg border border-slate-100 ">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                            LRO/RO Name
                          </div>
                          <div className="text-sm font-medium text-indigo-600 ">
                            {currentUser}
                          </div>
                        </div>
                      </div>

                      {/* Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div>
                          <label className="block text-xs font-bold text-card-foreground  mb-2">
                            Date of Site Visit{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Controller
                            name="dateOfVisit"
                            control={control}
                            render={({ field }) => (
                              <CustomDatePicker
                                value={field.value}
                                onChange={field.onChange}
                                className={cn(
                                  "w-full h-10 text-sm",
                                  errors.dateOfVisit && "border-red-300 ring-1 ring-red-500/20"
                                )}
                              />
                            )}
                          />
                          {errors.dateOfVisit && (
                            <p className="text-red-500 text-xs mt-1.5 font-medium">
                              {errors.dateOfVisit.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-card-foreground  mb-2">
                            Site Visit Participant{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Controller
                            name="participant"
                            control={control}
                            render={({ field }) => (
                              <CustomSelect
                                value={field.value}
                                onChange={field.onChange}
                                options={[
                                  { value: "RM", label: "RM (Relationship Manager)" },
                                  { value: "BM", label: "BM (Branch Manager)" },
                                  { value: "LRO", label: "LRO (Loan Recovery Officer)" },
                                  { value: "Multiple", label: "Multiple Managers" },
                                ]}
                                className={cn(
                                  "w-full h-10 text-sm justify-between",
                                  errors.participant && "border-red-300 ring-1 ring-red-500/20"
                                )}
                              />
                            )}
                          />
                          {errors.participant && (
                            <p className="text-red-500 text-xs mt-1.5 font-medium">
                              {errors.participant.message}
                            </p>
                          )}
                        </div>

                        <div
                          className={cn(
                            "col-span-full p-4 rounded-xl transition-all border",
                            npldParticipation
                              ? "bg-indigo-50/50  border-indigo-100 "
                              : "bg-transparent border-transparent",
                          )}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="block text-xs font-bold text-foreground">
                                  NPLD Participation
                                </label>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  Did a Non-Performing Loan Dept member join?
                                </p>
                              </div>
                              <Controller
                                name="npldParticipation"
                                control={control}
                                render={({ field }) => (
                                  <Switch
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                )}
                              />
                            </div>

                            <AnimatePresence>
                              {npldParticipation && (
                                <motion.div
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <label className="block text-xs font-bold text-card-foreground  mb-2">
                                    NPLD Name{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    {...register("npldName")}
                                    placeholder="Enter full name"
                                    className={cn(
                                      "w-full bg-card  border rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 transition-shadow",
                                      errors.npldName
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                        : "border-border  focus:border-indigo-500 focus:ring-indigo-500/20",
                                    )}
                                  />
                                  {errors.npldName && (
                                    <p className="text-red-500 text-xs mt-1.5 font-medium">
                                      {errors.npldName.message}
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Result of Visit */}
                  <div className="bg-card  rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="bg-muted  px-6 py-4 border-b border-slate-100  flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100  flex items-center justify-center text-emerald-600  shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                        Section II: Result of Visit
                      </h3>
                    </div>

                    <div className="p-6 space-y-8">
                      <div>
                        <label className="block text-xs font-bold text-card-foreground  mb-2">
                          Status of Business Operation{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          {...register("bizStatus")}
                          rows={3}
                          className={cn(
                            "w-full bg-card  border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-shadow resize-y",
                            errors.bizStatus
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                              : "border-border  focus:border-indigo-500 focus:ring-indigo-500/20",
                          )}
                          placeholder="Detail the current operational status, cashflow issues, etc."
                        />
                        {errors.bizStatus && (
                          <p className="text-red-500 text-xs mt-1.5 font-medium">
                            {errors.bizStatus.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-card-foreground  mb-2">
                          Status of Borrower{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name="borrowerStatus"
                          control={control}
                          render={({ field }) => (
                            <CustomSelect
                              value={field.value}
                              onChange={field.onChange}
                              options={[
                                { value: "Single", label: "Single" },
                                { value: "Married", label: "Married" },
                                { value: "Divorced", label: "Divorced" },
                                { value: "Deceased", label: "Deceased" },
                                { value: "Fled", label: "Fled/Unreachable" }
                              ]}
                              className={cn(
                                "w-full h-10 text-sm justify-between md:w-1/2",
                                errors.borrowerStatus && "border-red-300 ring-1 ring-red-500/20"
                              )}
                            />
                          )}
                        />
                        {errors.borrowerStatus && (
                          <p className="text-red-500 text-xs mt-1.5 font-medium">
                            {errors.borrowerStatus.message}
                          </p>
                        )}
                      </div>

                      {/* Collateral Status inside a sub-card */}
                      <div className="bg-muted  rounded-xl border border-border  overflow-hidden">
                        <div className="px-5 py-3 border-b border-border  bg-card  flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-muted-foreground" />
                          <h4 className="text-sm font-bold text-foreground">
                            Status of Collateral
                          </h4>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {/* 1. Physical change */}
                          <div
                            className={cn(
                              "p-5 transition-colors",
                              collateralPhysicalChange &&
                                "bg-indigo-50/30 ",
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-foreground  font-medium">
                                1. Physical change?
                              </span>
                              <Controller
                                name="collateralPhysicalChange"
                                control={control}
                                render={({ field }) => (
                                  <Switch
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                )}
                              />
                            </div>
                            <AnimatePresence>
                              {collateralPhysicalChange && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="pt-4 overflow-hidden"
                                >
                                  <input
                                    type="text"
                                    {...register("collateralPhysicalRemark")}
                                    placeholder="Remark / Details (Required)"
                                    className={cn(
                                      "w-full bg-card  border rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 transition-shadow",
                                      errors.collateralPhysicalRemark
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                        : "border-border  focus:border-indigo-500 focus:ring-indigo-500/20",
                                    )}
                                  />
                                  {errors.collateralPhysicalRemark && (
                                    <p className="text-red-500 text-xs mt-1.5 font-medium">
                                      {errors.collateralPhysicalRemark.message}
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* 2. Ownership Change */}
                          <div
                            className={cn(
                              "p-5 transition-colors",
                              collateralOwnershipChange &&
                                "bg-indigo-50/30 ",
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-foreground  font-medium">
                                2. Ownership Change?
                              </span>
                              <Controller
                                name="collateralOwnershipChange"
                                control={control}
                                render={({ field }) => (
                                  <Switch
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                )}
                              />
                            </div>
                            <AnimatePresence>
                              {collateralOwnershipChange && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="pt-4 overflow-hidden"
                                >
                                  <input
                                    type="text"
                                    {...register("collateralOwnershipRemark")}
                                    placeholder="Remark / Details (Required)"
                                    className={cn(
                                      "w-full bg-card  border rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 transition-shadow",
                                      errors.collateralOwnershipRemark
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                        : "border-border  focus:border-indigo-500 focus:ring-indigo-500/20",
                                    )}
                                  />
                                  {errors.collateralOwnershipRemark && (
                                    <p className="text-red-500 text-xs mt-1.5 font-medium">
                                      {errors.collateralOwnershipRemark.message}
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* 3. Change in Price */}
                          <div
                            className={cn(
                              "p-5 transition-colors",
                              collateralPriceChange &&
                                "bg-indigo-50/30 ",
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-foreground  font-medium">
                                3. Change in Price?
                              </span>
                              <Controller
                                name="collateralPriceChange"
                                control={control}
                                render={({ field }) => (
                                  <Switch
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                )}
                              />
                            </div>
                            <AnimatePresence>
                              {collateralPriceChange && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="pt-4 overflow-hidden"
                                >
                                  <input
                                    type="text"
                                    {...register("collateralPriceRemark")}
                                    placeholder="Remark / Details (Required)"
                                    className={cn(
                                      "w-full bg-card  border rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 transition-shadow",
                                      errors.collateralPriceRemark
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                        : "border-border  focus:border-indigo-500 focus:ring-indigo-500/20",
                                    )}
                                  />
                                  {errors.collateralPriceRemark && (
                                    <p className="text-red-500 text-xs mt-1.5 font-medium">
                                      {errors.collateralPriceRemark.message}
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Smaller Inputs Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                          <div>
                            <label className="block text-xs font-bold text-card-foreground  mb-2">
                              Ability to Resolve{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <Controller
                              name="abilityToResolve"
                              control={control}
                              render={({ field }) => (
                                <CustomSelect
                                  value={field.value}
                                  onChange={field.onChange}
                                  options={["Restructure", "Partial Payment", "Foreclosure", "Write-off", "Legal Action"]}
                                  className={cn(
                                    "w-full h-10 text-sm justify-between",
                                    errors.abilityToResolve && "border-red-300 ring-1 ring-red-500/20"
                                  )}
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-card-foreground  mb-2">
                              Action Date
                            </label>
                            <div className="relative">
                              <Controller
                                name="actionDate"
                                control={control}
                                render={({ field }) => (
                                  <CustomDatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    align="right"
                                    className={cn(
                                      "w-full h-10 text-sm",
                                      errors.actionDate && "border-red-300 ring-1 ring-red-500/20"
                                    )}
                                  />
                                )}
                              />
                            </div>
                            {errors.actionDate && (
                              <p className="text-red-500 text-xs mt-1.5 font-medium">
                                {errors.actionDate.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status of Solution */}
                        <div>
                          <label className="block text-xs font-bold text-card-foreground  mb-2">
                            Status of Solution
                          </label>
                          <textarea
                            {...register("solutionStatus")}
                            rows={2}
                            className="w-full bg-card  border border-border  rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                            placeholder="Describe the proposed solution"
                          />
                        </div>

                        {/* Customer Request & LRO Comment */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                          <div>
                            <label className="block text-xs font-bold text-card-foreground  mb-2">
                              Customer Request/Suggest
                            </label>
                            <textarea
                              {...register("customerRequest")}
                              rows={2}
                              className="w-full bg-card  border border-border  rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                              placeholder="Any requests made by the customer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-card-foreground  mb-2">
                              LRO Comment
                            </label>
                            <textarea
                              {...register("lroComment")}
                              rows={2}
                              className="w-full bg-card  border border-border  rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                              placeholder="Your comments and observations"
                            />
                          </div>
                        </div>

                        {/* Next Action */}
                        <div>
                          <label className="block text-xs font-bold text-card-foreground  mb-2">
                            Next Action
                          </label>
                          <textarea
                            {...register("nextAction")}
                            rows={2}
                            className="w-full bg-card  border border-border  rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                            placeholder="What are the specific next steps?"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-8 py-5 border-t border-border bg-background/95 backdrop-blur-md shrink-0 flex justify-end gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-muted-foreground  bg-card  border border-border  hover:bg-muted  transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-2.5 rounded-lg text-sm font-bold bg-indigo-600 text-primary-foreground hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-70 min-w-[200px]"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      SAVE REPORT
                    </>
                  )}
                </button>
              </div>
            </form>
            ) : (
              <div className="flex flex-col h-full">
                {/* Header for Tracker */}
                <div className="sticky top-0 z-10 px-8 py-5 border-b border-border bg-background/95 backdrop-blur-md shrink-0 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-foreground " />
                        Site-Visit Tracker
                      </h2>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tracking approval status for{" "}
                      <span className="font-semibold text-card-foreground ">
                        {account.customerName} ({account.cid})
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <SiteVisitTracker status={approvalStatus} onSimulateAction={handleSimulateAction} />
                
                {/* Footer for Tracker */}
                <footer className="sticky bottom-0 z-10 px-8 py-5 border-t border-border bg-background/95 backdrop-blur-md shrink-0 flex justify-end gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-11 px-8 rounded-xl bg-card border border-border text-foreground text-[11px] font-black uppercase tracking-widest hover:bg-muted transition-colors"
                  >
                    Close
                  </button>
                </footer>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
