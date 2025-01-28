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
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useEditBillStore } from '@/features/bills/hooks/edit-bill-store';
import { useDeleteBills } from '@/features/bills/actions';
import { Switch } from '@/components/ui/switch';

export type BillType = InferResponseType<typeof honoClient.api.bills.$get, 200>['data'][0];

export const columns: ColumnDef<BillType>[] = [
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
    accessorKey: 'dueDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex  justify-center items-center">
          {format(new Date(row.original.dueDate), 'PPP')}
        </div>
      );
    },
  },

  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },

  {
    accessorKey: 'type',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status === 'paid'
          ? 'successAccent'
          : status === 'pending'
          ? 'warningAccent'
          : 'destructiveAccent';

      return <Badge variant={variant}>{status}</Badge>;
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
      return (
        <div className="flex  justify-center items-center">
          {formatCurrency(row.original.amount)}
        </div>
      );
    },
  },

  {
    accessorKey: 'remind',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Notify
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <Switch checked={row.original.remind} />;
    },
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      const { setOpen } = useEditBillStore();
      const deleteMutation = useDeleteBills(row.original.id);

      const [ConfirmDialog, confirm] = useConfirm({
        title: 'Delete Bill',
        message: 'Are you sure you want to delete this Bill?',
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
