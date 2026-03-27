import { useState, memo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

interface DataTableProps<T> {
  columns: any[];
  data: T[];
  searchable?: boolean;
  onRowClick?: (row: T) => void;
  rowPadding?: 'sm' | 'md' | 'lg';
}

const DataTableComponent = <T,>({ columns, data, searchable, onRowClick, rowPadding = 'md' }: DataTableProps<T>) => {
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data, columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } }
  });

  const getPaddingClass = () => {
    switch (rowPadding) {
      case 'sm': return 'py-1.5';
      case 'lg': return 'py-5';
      case 'md':
      default: return 'py-2.5';
    }
  };

  const paddingClass = getPaddingClass();

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {searchable && (
        <div className="p-3 border-b border-gray-100">
          <input
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search records..."
            className="w-full max-w-[280px] bg-gray-50! text-[13px]!"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className={`px-4 ${paddingClass} text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider bg-gray-50`}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className={`border-b border-gray-100 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50'}`}
                onClick={() => onRowClick && onRowClick(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className={`px-4 ${paddingClass} text-[13px] text-gray-700`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-[13px] text-gray-400">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="border-t border-gray-100 px-4 py-2.5 flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded-md border border-gray-200 bg-white text-xs font-medium disabled:text-gray-300 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >Prev</button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded-md border border-gray-200 bg-white text-xs font-medium disabled:text-gray-300 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;
