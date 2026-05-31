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
      "w-11 h-6 rounded-full transition-colors relative flex items-center shrink-0 cursor-pointer border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
      checked ? "bg-indigo-600" : "bg-accent",
    )}
  >
    <span
      className={cn(
        "w-5 h-5 bg-card rounded-full transition-transform shadow-sm",
        checked ? "translate-x-5" : "translate-x-0",
      )}
    />
  </button>
);

export function SiteVisitDrawer({
  isOpen,
  onClose,
  onSave,
  account,
  currentUser,
  initialData,
}: SiteVisitDrawerProps) {
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
    }, 600);
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
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 transition-opacity"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-4xl bg-muted  shadow-2xl z-50 flex flex-col border-l border-border font-sans"
          >
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
                          <input
                            type="date"
                            {...register("dateOfVisit")}
                            className={cn(
                              "w-full bg-card  border rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 transition-shadow",
                              errors.dateOfVisit
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                : "border-border  focus:border-indigo-500 focus:ring-indigo-500/20",
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
                          <div className="relative">
                            <select
                              {...register("participant")}
                              className={cn(
                                "w-full bg-card  border rounded-lg h-10 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 transition-shadow appearance-none",
                                errors.participant
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                  : "border-border  focus:border-indigo-500 focus:ring-indigo-500/20",
                              )}
                            >
                              <option value="RM">
                                RM (Relationship Manager)
                              </option>
                              <option value="BM">BM (Branch Manager)</option>
                              <option value="LRO">
                                LRO (Loan Recovery Officer)
                              </option>
                              <option value="Multiple">
                                Multiple Managers
                              </option>
                            </select>
                            <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-3 top-3 pointer-events-none rotate-90" />
                          </div>
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
                        <div className="relative md:w-1/2">
                          <select
                            {...register("borrowerStatus")}
                            className={cn(
                              "w-full bg-card  border rounded-lg h-10 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 transition-shadow appearance-none",
                              errors.borrowerStatus
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                : "border-border  focus:border-indigo-500 focus:ring-indigo-500/20",
                            )}
                          >
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Deceased">Deceased</option>
                            <option value="Fled">Fled/Unreachable</option>
                          </select>
                          <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-3 top-3 pointer-events-none rotate-90" />
                        </div>
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
                              <span className="text-sm text-slate-800  font-medium">
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
                              <span className="text-sm text-slate-800  font-medium">
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
                              <span className="text-sm text-slate-800  font-medium">
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
                            <div className="relative">
                              <select
                                {...register("abilityToResolve")}
                                className={cn(
                                  "w-full bg-card  border rounded-lg h-10 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 transition-shadow appearance-none",
                                  errors.abilityToResolve
                                    ? "border-red-300 focus:ring-red-500/20"
                                    : "border-border  focus:border-indigo-500 focus:ring-indigo-500/20",
                                )}
                              >
                                <option value="Restructure">Restructure</option>
                                <option value="Partial Payment">
                                  Partial Payment
                                </option>
                                <option value="Foreclosure">Foreclosure</option>
                                <option value="Write-off">Write-off</option>
                                <option value="Legal Action">
                                  Legal Action
                                </option>
                              </select>
                              <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-3 top-3 pointer-events-none rotate-90" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-card-foreground  mb-2">
                              Action Date
                            </label>
                            <div className="relative">
                              <input
                                type="date"
                                {...register("actionDate")}
                                className={cn(
                                  "w-full bg-card  border rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 transition-shadow",
                                  errors.actionDate
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                    : "border-border  focus:border-indigo-500 focus:ring-indigo-500/20",
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
