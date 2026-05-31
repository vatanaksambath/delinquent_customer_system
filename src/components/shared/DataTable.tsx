"use client";
import React from "react";

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  className = "",
}: DataTableProps<T>) {
  return (
    <div
      className={`w-full overflow-auto rounded-md border border-border ${className}`}
    >
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/80 text-muted-foreground text-[9px] uppercase font-bold tracking-[0.2em]">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3.5 whitespace-nowrap border-b border-border">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-20 text-center"
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-muted-foreground/50">table_rows</span>
                  </div>
                  <p className="text-sm font-bold text-foreground/70 uppercase tracking-widest">No Data Available</p>
                  <p className="text-xs text-muted-foreground max-w-xs">There are no records matching your current criteria. Try adjusting your filters.</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr
                key={i}
                className="bg-card hover:bg-primary/5 transition-colors cursor-pointer group"
              >
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-3.5 whitespace-nowrap text-[11px] font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                    {col.cell
                      ? col.cell(item)
                      : String(item[col.accessorKey] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
