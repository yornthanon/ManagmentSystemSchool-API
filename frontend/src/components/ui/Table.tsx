import React from 'react';
import {cn} from '@/src/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No records found.',
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 px-4 text-center text-sm text-slate-500">{emptyMessage}</div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-slate-50/60 transition-colors">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn('px-5 py-3.5 text-sm text-slate-700', col.className)}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
