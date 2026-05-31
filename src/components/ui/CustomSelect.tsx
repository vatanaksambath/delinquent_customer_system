import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search } from "lucide-react";

export interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[] | string[];
  icon?: string;
  className?: string;
  label?: string;
  required?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  icon,
  className = "",
  label,
  required = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize options to object format
  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedLabel =
    normalizedOptions.find((o) => o.value === value)?.label ||
    (normalizedOptions.length > 0 ? normalizedOptions[0].label : "Select...");

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const selectBody = (
    <div
      ref={ref}
      className={`relative flex items-center gap-1.5 border border-border rounded-lg px-3 py-2 bg-card group hover:border-primary/40 transition-all shadow-sm cursor-pointer select-none ${isOpen ? "z-[100] border-primary/50 ring-1 ring-primary/20" : "z-10"} ${className}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {icon && (
        <span className="material-symbols-outlined text-[16px] text-muted-foreground">
          {icon}
        </span>
      )}
      <div className={`flex-1 text-[10px] font-bold uppercase tracking-widest relative top-[0.5px] truncate ${value ? "text-foreground" : "text-muted-foreground"}`}>
        {selectedLabel}
      </div>
      <span
        className={`material-symbols-outlined text-[16px] text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      >
        expand_more
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-[calc(100%+6px)] w-full min-w-[180px] bg-card border border-border rounded-lg shadow-2xl z-[150] overflow-hidden flex flex-col max-h-[300px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-border shrink-0 sticky top-0 bg-card">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="h-3 w-3 text-muted-foreground" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-muted/50 border border-border rounded text-[10px] font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors placeholder:uppercase placeholder:tracking-widest text-foreground"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto py-1 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.value}
                    className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors flex items-center justify-between ${
                      value === opt.value
                        ? "bg-primary/5 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    {opt.label}
                    {value === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-slate-500 shadow-[0_0_6px_rgba(100,116,139,0.4)]"></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  No matches found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (label) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 ml-1 flex items-center">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
        {selectBody}
      </div>
    );
  }

  return selectBody;
}
