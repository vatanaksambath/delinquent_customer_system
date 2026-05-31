"use client";
import React from "react";
import { Download } from "lucide-react";

export function ExportDropdown({
  onExport,
}: {
  onExport: (format: "pdf" | "excel" | "csv") => void;
}) {
  return (
    <button
      onClick={() => onExport("csv")}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors"
    >
      <Download className="w-4 h-4" /> Export CSV
    </button>
  );
}
