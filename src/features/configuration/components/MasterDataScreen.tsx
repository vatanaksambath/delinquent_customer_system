import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useMasterDataStore, MasterDataCategory } from "@/store/masterDataStore";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORY_LABELS: Record<MasterDataCategory, string> = {
  reasonLoanDefault: "Reason of Loan Default",
  legalAction: "Legal Action",
  legalStage: "Legal Stage",
  channelContact: "Channel of Contact",
  possibleSolution: "Possible Solution",
  specificResolution: "Specific Resolution",
  resolutionStatus: "Resolution Status",
  issueLetter: "Issue Letter",
  deliveryLetterChannel: "Delivery Letter Channel",
  actionProgress: "Action Progress",
  noneSolution: "None Solution",
  nextActionType: "Next Action Type",
  industryType: "Industry Type",
  businessType: "Business Type",
};

export default function MasterDataScreen() {
  const { data, addMasterData, updateMasterData, removeMasterData } =
    useMasterDataStore();

  const [activeCategory, setActiveCategory] =
    useState<MasterDataCategory>("reasonLoanDefault");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  const activeData = data[activeCategory] || [];
  const filteredData = activeData.filter((item) =>
    item.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingId(null);
    setInputValue("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (id: string, currentValue: string) => {
    setModalMode("edit");
    setEditingId(id);
    setInputValue(currentValue);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!inputValue.trim()) return;

    if (modalMode === "add") {
      addMasterData(activeCategory, inputValue.trim());
    } else if (modalMode === "edit" && editingId) {
      updateMasterData(activeCategory, editingId, inputValue.trim());
    }

    setIsModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full flex bg-muted relative"
    >
      {/* Sidebar for Categories */}
      <div className="w-64 border-r border-border bg-card flex flex-col z-10 shrink-0 h-full overflow-y-auto custom-scrollbar">
        <div className="p-4 border-b border-border sticky top-0 bg-card z-20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Categories</h2>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-2">
            Select a table
          </p>
        </div>
        <div className="p-2 flex flex-col gap-1 pb-10">
          {(Object.keys(CATEGORY_LABELS) as MasterDataCategory[]).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchQuery("");
                }}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <span className="truncate pr-2">{CATEGORY_LABELS[cat]}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-8 py-8 shrink-0 bg-background/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {CATEGORY_LABELS[activeCategory]}
              </h1>
              <p className="text-muted-foreground text-sm font-medium mt-1">
                Manage lookup values for this category to be used across forms.
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Option
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search options..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
              />
            </div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Total items: {filteredData.length}
            </div>
          </div>
        </div>

        {/* List View */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item.id}
                    className="bg-card border border-border rounded-xl p-4 flex items-center justify-between group hover:border-indigo-500/30 transition-colors shadow-sm"
                  >
                    <span className="text-sm font-medium text-foreground truncate pr-4">
                      {item.value}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(item.id, item.value)}
                        className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete "${item.value}"?`
                            )
                          ) {
                            removeMasterData(activeCategory, item.id);
                          }
                        }}
                        className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground"
                >
                  <Database className="w-12 h-12 opacity-20 mb-4" />
                  <p className="text-sm font-medium">
                    No options found for this category.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                <h3 className="text-lg font-bold text-foreground tracking-tight">
                  {modalMode === "add" ? "Add New Option" : "Edit Option"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Option Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSave();
                    }
                  }}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Enter value..."
                />

                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg flex gap-3 text-amber-800 dark:text-amber-500">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium leading-relaxed">
                    Modifying this lookup value affects its availability in future data entry. Existing records will not be altered retroactively.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!inputValue.trim()}
                  className="px-6 py-2 bg-indigo-600 disabled:opacity-50 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
