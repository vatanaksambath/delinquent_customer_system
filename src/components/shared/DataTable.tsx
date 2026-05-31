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
        <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 whitespace-nowrap">
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
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr
                key={i}
                className="bg-card hover:bg-muted/50 transition-colors"
              >
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-3 whitespace-nowrap">
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
