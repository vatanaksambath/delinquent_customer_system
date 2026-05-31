import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MasterDataCategory =
  | "reasonLoanDefault"
  | "legalAction"
  | "legalStage"
  | "channelContact"
  | "possibleSolution"
  | "specificResolution"
  | "resolutionStatus"
  | "issueLetter"
  | "deliveryLetterChannel"
  | "actionProgress"
  | "noneSolution"
  | "nextActionType"
  | "industryType"
  | "businessType";

export type MasterDataItem = {
  id: string;
  value: string;
};

export type MasterDataState = {
  data: Record<MasterDataCategory, MasterDataItem[]>;
  addMasterData: (category: MasterDataCategory, value: string) => void;
  updateMasterData: (category: MasterDataCategory, id: string, value: string) => void;
  removeMasterData: (category: MasterDataCategory, id: string) => void;
};

const defaultData: Record<MasterDataCategory, MasterDataItem[]> = {
  reasonLoanDefault: [
    "Business Failure",
    "Wrong Loan Purpose",
    "Over-debt",
    "Family Dispute",
    "Collateral Issue",
    "Business Dispute",
    "Fraudulence",
    "Gambling",
    "Main Borrower Pass Away",
    "Market Volatility",
    "Personal Exigency",
    "Medical Issues",
    "Property Damage",
    "Other",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  legalAction: [
    "Non Legal Case",
    "Legal Case",
    "Mediation Pending",
    "Litigation Initiated",
    "Asset Seizure",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  legalStage: [
    "In process at court",
    "In process at legal team",
    "Preparing submit for legal",
    "Subject to take legal action if fail",
    "Not Started",
    "Information Gathering",
    "Notice Issued",
    "Court Filing",
    "Judgment",
    "Execution",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  channelContact: [
    "Phone Call",
    "Chat",
    "Site Visit",
    "Office Meeting",
    "Email/Letter",
    "Third Party Messenger",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  possibleSolution: [
    "Expect to normalize",
    "Expect to restructure",
    "Pay-off",
    "Full Settlement",
    "Partial Settlement",
    "Restructuring",
    "Grace Period Extension",
    "Asset Liquidation",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  specificResolution: [
    "Promise to pay",
    "Deposit full repayment",
    "Deposit some of full repayment",
    "Request to add loan to settle over",
    "Request to restructure",
    "Request to grace period",
    "Request to extend loan",
    "Request to reduce repayment",
    "Request to defer principal",
    "Request to defer interest",
    "Request to defer principal & interest",
    "Request to pay-off (close account)",
    "Request to partial principal",
    "Installment Plan Agreement",
    "Interest Rate Reduction",
    "Collateral Swap",
    "Third-Party Buyout",
    "Other ..",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  resolutionStatus: [
    "Clear DPD",
    "Waiting Approval",
    "Request Stage",
    "Submit Stage",
    "Approved Stage",
    "Pending Disbursement",
    "Disbursed",
    "Negotiation",
    "Pending Documentation",
    "Sent for Approval",
    "Signed/Executed",
    "Implementation",
    "Other ...",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  issueLetter: [
    "1st Informing letter",
    "2nd Informing letter",
    "3rd Informing letter",
    "4th Demanding letter",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  deliveryLetterChannel: [
    "Physical (site visit)",
    "Digital (via telegram...)",
    "Hand Delivery",
    "Registered Post",
    "Courier Service",
    "Digital Portal",
    "Email Confirmation",
    "Public Notice",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  actionProgress: [
    "Prepare request to take legal action",
    "Waiting approval to take legal action",
    "Rejected to take legal action",
    "0% Initiated",
    "25% Evidence Building",
    "50% Internal Audit",
    "75% Approval Stage",
    "100% Resolved",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  noneSolution: [
    "Legal Escalation",
    "Account Suspension",
    "Write-off Investigation",
    "Collateral Possession",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  nextActionType: [
    "Follow-up Call",
    "Second Site Visit",
    "Third-Party Verification",
    "Legal Demand Letter",
    "Enforcement Inquiry",
    "Will call to customer again",
    "Will conduct site-visit",
    "Will chat again"
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  industryType: [
    "Retail",
    "Manufacturing",
    "Technology",
    "Service",
    "Agriculture",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
  businessType: [
    "Sole Proprietorship",
    "Partnership",
    "Corporate Entity",
    "Non-Profit",
    "Government",
  ].map((v) => ({ id: crypto.randomUUID(), value: v })),
};

export const useMasterDataStore = create<MasterDataState>()(
  persist(
    (set) => ({
      data: defaultData,
      addMasterData: (category, value) =>
        set((state) => ({
          data: {
            ...state.data,
            [category]: [
              ...state.data[category],
              { id: crypto.randomUUID(), value },
            ],
          },
        })),
      updateMasterData: (category, id, value) =>
        set((state) => ({
          data: {
            ...state.data,
            [category]: state.data[category].map((item) =>
              item.id === id ? { ...item, value } : item
            ),
          },
        })),
      removeMasterData: (category, id) =>
        set((state) => ({
          data: {
            ...state.data,
            [category]: state.data[category].filter((item) => item.id !== id),
          },
        })),
    }),
    {
      name: "mdcs-master-data-storage",
    }
  )
);
