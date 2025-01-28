'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { TransactionType, columns } from './_components/columns';
import useConfirm from '@/hooks/use-confirm';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateTransactionStore } from '@/features/transactions/hooks/create-transaction-store';
import {
  useBulkCreateTransactions,
  useBulkDeleteTransactions,
  useGetTransactions,
} from '@/features/transactions/actions';
import { TransactionTable } from './_components/data-table';
import { useState } from 'react';
import UploadButton from './_components/upload-button';
import ImportCard from './_components/import-card';
import { transactionsTable as TransactionSchema, creationTypeEnum } from '@/db/schema';
import { toast } from 'sonner';
import useAccountSelect from '@/features/accounts/hooks/use-account-select';

import { MAX_FREE_TRANSACTIONS } from '@/lib/const';

import { useGetDataCount } from '@/features/summary/actions';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';
import { useUser } from '@clerk/nextjs';
import { useBulkCreateCategories } from '@/features/categories/actions';
import { convertAmountToMiliUnit } from '../../../lib/utils';

enum PAGE_VARIANT {
  LIST = 'LIST',
  IMPORT = 'IMPORT',
}

const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

const Page = () => {
  const { user } = useUser();
  const createBulkCategories = useBulkCreateCategories();
  const [pageVariant, setPageVariant] = useState<PAGE_VARIANT>(PAGE_VARIANT.LIST);
  const [initialCSVData, setInitialCSVData] = useState(INITIAL_IMPORT_RESULTS);

  const { setOpen: setTransactionOpenModal } = useCreateTransactionStore();
  const transactionsQuery = useGetTransactions();
  const transactionsData: TransactionType[] = transactionsQuery.data ?? [];

  const deleteMutation = useBulkDeleteTransactions();
  const createBulkTransactionMutation = useBulkCreateTransactions();

  const { plan, setOpen: setPlanModalOpen } = useSubscriptionStore();
  const { isLoading: isLoadingCount, data: countData } = useGetDataCount();

  const [ConfirmDialog, confirm] = useConfirm({
    title: 'Delete Transactions',
    message: 'Are you sure you want to delete all this transactions?',
  });

  const [SelectAccountDialog, ok] = useAccountSelect({
    title: 'Select Account',
    message: 'Please select an account to continue',
  });

  const handleDelete = async (ids: string[]) => {
    const ok = await confirm();
    if (!ok) return;
    deleteMutation.mutate({ ids });
  };

  const onUpload = (result: any) => {
    setInitialCSVData(result);
    setPageVariant(PAGE_VARIANT.IMPORT);
  };

  const onCancel = () => {
    setPageVariant(PAGE_VARIANT.LIST);
    setInitialCSVData(INITIAL_IMPORT_RESULTS);
  };

  const handleImportSubmit = async (
    data: (typeof TransactionSchema.$inferInsert & { category?: string })[]
  ) => {
    const confirmData = await ok();
    if (!confirmData) return;

    if (!confirmData.accountId) {
      return toast.error('Please select an account to continue');
    }

    if (data[0].category && user) {
      const categories = data.map((item) => ({
        name: item.category as string,
        budget: convertAmountToMiliUnit(confirmData.budget as number) || 0,
        userId: user.id,
      }));

      createBulkCategories.mutate(categories, {
        onSuccess: (categoriesIdsData) => {
          const jsonData = data.map((item, idx) => ({
            ...item,
            creationType: creationTypeEnum.enumValues[0],
            notes: item.notes,
            accountId: confirmData.accountId as string,
            categoryId: categoriesIdsData[idx].id,
          }));

          createBulkTransactionMutation.mutate(jsonData, {
            onSuccess: () => {
              onCancel();
            },
          });
        },
      });
    } else {
      const jsonData = data.map((item) => ({
        ...item,
        creationType: creationTypeEnum.enumValues[0],
        notes: item.notes,
        accountId: confirmData.accountId as string,
      }));

      createBulkTransactionMutation.mutate(jsonData, {
        onSuccess: () => {
          onCancel();
        },
      });
    }
  };

  const handleAddTransactions = () => {
    if (!countData) return;
    const isFreePlanCompleted = countData.transactionCount >= MAX_FREE_TRANSACTIONS;

    if (plan === 'free' && isFreePlanCompleted) {
      toast.info('Please upgrade  your plan to add more transactions');
      setPlanModalOpen(true);
      return;
    }
    setTransactionOpenModal(true);
  };

  if (pageVariant === PAGE_VARIANT.IMPORT) {
    return (
      <>
        <SelectAccountDialog />
        <ImportCard onCancel={onCancel} data={initialCSVData.data} onSubmit={handleImportSubmit} />
      </>
    );
  }

  if (transactionsQuery.isLoading) {
    return (
      <Card className="border border-primary max-w-screen-xl mx-5  lg:mx-auto shadow-md p-4 mt-[-140px]">
        <CardHeader className="w-full">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-8 w-96" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center w-full h-[300px]">
            <Loader2 className=" animate-spin size-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <Card className="border border-primary max-w-screen-xl mx-5 lg:mx-auto shadow-md p-4 mt-[-140px]">
        <CardHeader className="flex flex-col sm:flex-row gap-y-1 items-center justify-between">
          <CardTitle className="text-2xl text-center sm:text-left font-semibold">
            Transaction page
          </CardTitle>
          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-y-1 sm:gap-y-0 sm:gap-x-2 items-center">
            <UploadButton plan={plan} setPlanModalOpen={setPlanModalOpen} onUpload={onUpload} />
            <Button
              onClick={handleAddTransactions}
              disabled={isLoadingCount || deleteMutation.isPending}
              className="w-full sm:w-auto"
            >
              <div className="flex items-center">
                <Plus className=" size-4 text-white" />
                <span className="ml-0.5 text-white">Add new</span>
              </div>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionTable
            data={transactionsData}
            columns={columns}
            onDelete={handleDelete}
            filterKey="payee"
            disabled={deleteMutation.isPending}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
