'use client';

import {
  ColumnDef,
  flexRender,
  getPaginationRowModel,
  getCoreRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { AccountType } from './columns';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<AccountType, TValue>[];
  data: AccountType[];
  filterKey: string;
  onDelete: (ids: string[]) => void;
  disabled: boolean;
}

export function AccountsTable<AccountType, TValue>({
  columns,
  data,
  filterKey,
  onDelete,
  disabled,
}: DataTableProps<AccountType, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      <div className="flex  gap-x-2 flex-row items-center py-4 justify-between">
        <Input
          placeholder="Filter account name..."
          value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn(filterKey)?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            disabled={disabled}
            size={'sm'}
            className="w-auto font-normal text-xs"
            onClick={() => {
              onDelete(table.getFilteredSelectedRowModel().rows.map((row) => row.original.id));
              table.resetRowSelection();
            }}
            variant={'outline'}
          >{`(${table.getFilteredSelectedRowModel().rows.length}) Delete`}</Button>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:flex-row w-full items-center justify-between">
        <p className="text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} out of {table.getRowModel().rows.length}{' '}
          rows selected.
        </p>
        <div className="flex items-center justify-center md:justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full md:w-auto"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full md:w-auto"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
