'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Download, MoreHorizontal, Receipt } from 'lucide-react';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InferResponseType } from 'hono';
import { honoClient, formatCurrency, convertAmountFromMiliUnit, downLoadJSON } from '@/lib/utils';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';

export type InvoiceType = InferResponseType<
  (typeof honoClient.api.subscriptions)['subscription-invoice']['$get'],
  200
>['data'][0];

export const columns: ColumnDef<InvoiceType>[] = [
  {
    accessorKey: 'plan',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Plan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'total',
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
        <div className="flex items-center justify-center">
          <Badge variant={'success'}>
            {formatCurrency(convertAmountFromMiliUnit(row.original.total))}
          </Badge>
        </div>
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
          status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const getVariantByStatus = (status: string) => {
        switch (status) {
          case 'paid':
            return 'successAccent';
          case 'unpaid':
            return 'destructiveAccent';
          case 'pending':
            return 'warningAccent';
          default:
            return 'outline';
        }
      };
      return (
        <div className="flex items-center justify-center">
          <Badge variant={getVariantByStatus(row.original.status)}>{row.original.status}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'billingReason',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Reason
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center">
          {row.original.billingReason}
        </div>
      );
    },
  },

  {
    accessorKey: 'createdAt',
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
        <div className="flex items-center justify-center">
          {format(row.original.createdAt, 'PPP')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link
                  href={row.original.invoiceUrl}
                  target="_blank"
                  className="flex items-center gap-2"
                >
                  <Receipt className="size-4" />
                  <span>Manage invoice</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => downLoadJSON(row.original, 'invoice-details.json')}>
                <div className="flex items-center cursor-pointer gap-2">
                  <Download className="size-4" />
                  <span>Download JSON</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
