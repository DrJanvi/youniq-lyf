import type { ReactNode } from "react";

export type Column<T> = { header: string; cell: (row: T) => ReactNode };

export function DataTable<T extends { id: string }>({ columns, rows, empty = "Nothing here yet." }: { columns: Column<T>[]; rows: T[]; empty?: string }) {
  if (!rows.length) return <p>{empty}</p>;
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.header} className="border-b p-2">
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            {columns.map((c) => (
              <td key={c.header} className="border-b p-2 align-top">
                {c.cell(r)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
