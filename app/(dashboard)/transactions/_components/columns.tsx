'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2Icon } from 'lucide-react';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import useConfirm from '@/hooks/use-confirm';
import { InferResponseType } from 'hono';
import { formatCurrency, honoClient } from '@/lib/utils';
import { useEditTransactionStore } from '@/features/transactions/hooks/edit-transaction-store';
import { useDeleteTransaction } from '@/features/transactions/actions';
import AccountColumn from './account-column';
import CategoryColumn from './category-column';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export type TransactionType = InferResponseType<
  typeof honoClient.api.transactions.$get,
  200
>['data'][0];

export const columns: ColumnDef<TransactionType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex  justify-center items-center">
          {format(new Date(row.original.date), 'PPP')}
        </div>
      );
    },
  },
  {
    accessorKey: 'accountName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Account
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <AccountColumn name={row.original.accountName} id={row.original.accountId} />
    ),
  },
  {
    accessorKey: 'categoryName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <CategoryColumn
        name={row.original.categoryName}
        id={row.original.categoryId}
        transactionId={row.original.id}
      />
    ),
  },
  {
    accessorKey: 'payee',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Payee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = row.original.amount;
      const variant =
        amount < 0 ? 'destructiveAccent' : amount > 0 ? 'successAccent' : 'warningAccent';

      return (
        <div className="flex  justify-center items-center">
          <Badge variant={variant}>{formatCurrency(amount)}</Badge>
        </div>
      );
    },
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      const { setOpen } = useEditTransactionStore();
      const deleteMutation = useDeleteTransaction(row.original.id);

      const [ConfirmDialog, confirm] = useConfirm({
        title: 'Delete Transaction',
        message: 'Are you sure you want to delete this transaction?',
      });

      const handleDelete = async () => {
        const ok = await confirm();
        if (!ok) return;
        deleteMutation.mutate();
      };

      return (
        <>
          <ConfirmDialog />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setOpen(true, row.original.id);
                }}
              >
                <div className="flex items-center gap-2">
                  <Edit className="size-4" />
                  <span>Edit</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete}>
                <div className="flex items-center gap-2">
                  <Trash2Icon className="size-4" />
                  <span>Delete</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
