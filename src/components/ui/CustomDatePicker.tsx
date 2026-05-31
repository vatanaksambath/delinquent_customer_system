import React, { useState, useRef, useEffect } from "react";
import { 
  format, 
  parse, 
  subDays, 
  startOfWeek, 
  subWeeks, 
  startOfMonth, 
  subMonths, 
  startOfYear, 
  subYears 
} from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

export function CustomDatePicker({ value, onChange, className = "", label, required = false }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let selectedDate: Date | undefined = undefined;
  try {
    if (value) {
      if (value.includes("T")) {
        selectedDate = new Date(value);
      } else {
        selectedDate = parse(value, "yyyy-MM-dd", new Date());
      }
    }
  } catch (e) {
    console.error("Invalid date value", value);
  }

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
      setIsOpen(false);
    }
  };

  const handlePreset = (preset: string) => {
    const today = new Date();
    let d: Date | undefined;
    switch(preset) {
      case "Today": d = today; break;
      case "Yesterday": d = subDays(today, 1); break;
      case "This week": d = startOfWeek(today, { weekStartsOn: 1 }); break;
      case "Last week": d = subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1); break;
      case "This month": d = startOfMonth(today); break;
      case "Last month": d = subMonths(startOfMonth(today), 1); break;
      case "This year": d = startOfYear(today); break;
      case "Last year": d = subYears(startOfYear(today), 1); break;
      case "All time": onChange(""); setIsOpen(false); return;
    }
    if (d) handleSelect(d);
  };

  const presets = [
    "Today", "Yesterday", "This week", "Last week", 
    "This month", "Last month", "This year", "Last year", "All time"
  ];

  const body = (
    <div ref={ref} className="relative w-full font-sans">
      <div
        className={`flex items-center justify-between border border-border rounded-lg px-3 h-10 bg-card hover:border-primary/40 transition-all shadow-sm cursor-pointer select-none ${isOpen ? "border-blue-500/50 ring-1 ring-blue-500/20" : ""} ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-sm text-foreground font-normal">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          {selectedDate ? format(selectedDate, "dd-MM-yyyy") : <span className="text-muted-foreground font-normal">Select date</span>}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+8px)] bg-card border border-border rounded-xl shadow-2xl z-[150] flex overflow-hidden w-auto"
          >
            <style>{`
              .rdp-root {
                --rdp-accent-color: #3b82f6; /* blue-500 */
                --rdp-background-color: #dbeafe; /* blue-100 */
                --rdp-accent-color-dark: #3b82f6;
                --rdp-background-color-dark: #1e40af;
                --rdp-outline: 2px solid #3b82f6;
                --rdp-outline-selected: 2px solid #3b82f6;
                --rdp-nav-height: 28px;
                margin: 0;
              }
              .rdp-caption {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 0.5rem;
                padding: 0 0.25rem;
              }
              .rdp-caption_label {
                font-weight: 600;
                font-size: 0.85rem;
              }
              .rdp-nav {
                display: flex;
                align-items: center;
                gap: 0.25rem;
              }
              .rdp-nav_button {
                border: 1px solid hsl(var(--border));
                border-radius: 0.35rem;
                width: 26px;
                height: 26px;
                background-color: transparent;
                transition: background-color 0.15s ease;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .rdp-nav_button:hover {
                background-color: hsl(var(--muted));
              }
              .rdp-nav_button svg {
                width: 14px;
                height: 14px;
              }
              .rdp-table {
                border-collapse: separate;
                border-spacing: 0.25rem;
              }
              .rdp-day {
                border-radius: 0.35rem;
                font-size: 0.75rem;
                height: 28px;
                width: 28px;
                cursor: pointer;
              }
              .rdp-day:hover:not(.rdp-day_selected) {
                background-color: hsl(var(--muted));
              }
              .rdp-day_selected {
                background-color: #3b82f6 !important;
                color: white !important;
                font-weight: normal;
                border-radius: 0.35rem;
              }
              .rdp-head_cell {
                font-weight: 500;
                color: hsl(var(--muted-foreground));
                text-transform: capitalize;
                font-size: 0.7rem;
              }
            `}</style>
            
            {/* Left Presets Sidebar */}
            <div className="w-[110px] border-r border-border bg-slate-50/50 dark:bg-card p-2 flex flex-col gap-0.5 shrink-0">
              {presets.map((preset) => (
                <button
                  key={preset}
                  className="text-left px-2 py-1.5 text-[11px] font-medium text-foreground/80 hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted rounded-md transition-colors"
                  onClick={(e) => { e.preventDefault(); handlePreset(preset); }}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Right Calendar Area */}
            <div className="p-3 bg-card">
              <DayPicker 
                mode="single" 
                selected={selectedDate} 
                onSelect={handleSelect}
                className="text-foreground"
                showOutsideDays
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (label) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 ml-1 flex items-center">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
        {body}
      </div>
    );
  }

  return body;
}
