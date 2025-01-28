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
import { honoClient, formatCurrency } from '@/lib/utils';
import { useDeleteCategory } from '@/features/categories/actions';
import { useEditCategoryStore } from '@/features/categories/hooks/edit-category-store';
import { Badge } from '@/components/ui/badge';

export type CategoryType = InferResponseType<typeof honoClient.api.categories.$get, 200>['data'][0];

export const columns: ColumnDef<CategoryType>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'budget',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Budget
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <Badge>{formatCurrency(row.original.budget)}</Badge>;
    },
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      const { open, setOpen } = useEditCategoryStore();
      const deleteMutation = useDeleteCategory(row.original.id);

      const [ConfirmDialog, confirm] = useConfirm({
        title: 'Delete Category',
        message: 'Are you sure you want to delete this category?',
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
                  <Edit className=" size-4" />
                  <span>Edit</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete}>
                <div className="flex items-center gap-2">
                  <Trash2Icon className=" size-4" />
                  <span> Delete</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
