import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

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
  const ref = useRef<HTMLDivElement>(null);

  // Normalize options to object format
  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedLabel =
    normalizedOptions.find((o) => o.value === value)?.label ||
    (normalizedOptions.length > 0 ? normalizedOptions[0].label : "Select...");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <div className={`flex-1 text-[10px] font-bold uppercase tracking-widest relative top-[0.5px] truncate ${value ? "text-slate-500" : "text-foreground"}`}>
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
            className="absolute left-0 top-[calc(100%+6px)] w-full min-w-[180px] bg-card border border-border rounded-lg shadow-2xl z-[150] overflow-hidden py-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {normalizedOptions.map((opt) => (
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
                }}
              >
                {opt.label}
                {value === opt.value && (
                  <div className="w-2 h-2 rounded-full bg-slate-500 shadow-[0_0_6px_rgba(100,116,139,0.4)]"></div>
                )}
              </div>
            ))}
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
