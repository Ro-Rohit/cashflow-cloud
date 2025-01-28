'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { BillType, columns } from './_components/columns';
import useConfirm from '@/hooks/use-confirm';
import { Skeleton } from '@/components/ui/skeleton';

import { useState } from 'react';
import UploadButton from './_components/upload-button';
import ImportCard from './_components/import-card';
import { BillStatusType, BillTypeEnumType } from '@/db/schema';
import { toast } from 'sonner';

import { MAX_FREE_BILLS } from '@/lib/const';

import { useGetDataCount } from '@/features/summary/actions';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';
import { useUser } from '@clerk/nextjs';
import { useCreateBillStore } from '@/features/bills/hooks/create-bill-store';
import { useBulkCreateBills, useBulkDeleteBills, useGetBills } from '@/features/bills/actions';
import { BillsTable } from './_components/data-table';
import useBillSelect from '@/features/bills/hooks/use-bill-select';

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
  const [pageVariant, setPageVariant] = useState<PAGE_VARIANT>(PAGE_VARIANT.LIST);
  const [initialCSVData, setInitialCSVData] = useState(INITIAL_IMPORT_RESULTS);

  const { setOpen: setBillOpenModal } = useCreateBillStore();
  const billsQuery = useGetBills();
  const billsData: BillType[] = billsQuery.data ?? [];

  const deleteMutation = useBulkDeleteBills();
  const createBulkBillsMutation = useBulkCreateBills();

  const { plan, setOpen: setPlanModalOpen } = useSubscriptionStore();
  const { isLoading: isLoadingCount, data: countData } = useGetDataCount();

  const [BillSelectDialog, ok] = useBillSelect({
    title: 'Select Bills Status and Type',
    message: 'Select status and type  for all selected bills',
  });

  const [ConfirmDialog, confirm] = useConfirm({
    title: 'Delete Bills',
    message: 'Are you sure you want to delete all this Bills?',
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

  const handleImportSubmit = async (data: { amount: number; dueDate: string; name: string }[]) => {
    const billData = await ok();
    if (!billData) return;
    if (!user) return;

    const jsonData = data.map((item) => ({
      ...item,
      dueDate: new Date(item.dueDate),
      userId: user.id,
      status: billData.status as BillStatusType,
      remind: billData.remind,
      type: billData.type as BillTypeEnumType,
    }));

    createBulkBillsMutation.mutate(jsonData, {
      onSuccess: () => {
        onCancel();
      },
    });
  };

  const handleAddBills = () => {
    if (!countData) return;
    const isFreePlanCompleted = countData.billsCount >= MAX_FREE_BILLS;

    if (plan === 'free' && isFreePlanCompleted) {
      toast.info('Please upgrade  your plan to add more bills');
      setPlanModalOpen(true);
      return;
    }
    setBillOpenModal(true);
  };

  if (pageVariant === PAGE_VARIANT.IMPORT) {
    return (
      <>
        <BillSelectDialog />
        <ImportCard onCancel={onCancel} data={initialCSVData.data} onSubmit={handleImportSubmit} />
      </>
    );
  }

  if (billsQuery.isLoading) {
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
      <Card className="border border-primary max-w-screen-xl mx-5 lg:mx-auto shadow-md p-4 mb-10 mt-[-140px]">
        <CardHeader className="flex flex-col sm:flex-row gap-y-1 items-center justify-between">
          <CardTitle className="text-2xl text-center sm:text-left font-semibold">
            Bills page
          </CardTitle>
          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-y-1 sm:gap-y-0 sm:gap-x-2 items-center">
            <UploadButton plan={plan} setPlanModalOpen={setPlanModalOpen} onUpload={onUpload} />
            <Button
              onClick={handleAddBills}
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
          <BillsTable
            data={billsData}
            columns={columns}
            onDelete={handleDelete}
            filterKey="name"
            disabled={deleteMutation.isPending}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
