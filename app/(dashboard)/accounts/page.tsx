'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountsTable } from './_components/data-table';
import { useBulkDeleteAccount, useGetAccounts } from '@/features/accounts/actions';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { AccountType, columns } from './_components/columns';
import useConfirm from '@/hooks/use-confirm';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateAccountStore } from '@/features/accounts/hooks/create-account-store';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';
import { useGetDataCount } from '@/features/summary/actions';
import { MAX_FREE_ACCOUNT, MAX_PRO_ACCOUNT } from '@/lib/const';
import { toast } from 'sonner';

const Page = () => {
  const { setOpen: setAccountOpenModal } = useCreateAccountStore();
  const { plan, setOpen: setPlanModalOpen } = useSubscriptionStore();

  const { isLoading: isLoadingCount, data: countData } = useGetDataCount();
  const accountQuery = useGetAccounts();
  const accountData: AccountType[] = accountQuery.data ?? [];
  const deleteMutation = useBulkDeleteAccount();

  const [ConfirmDialog, confirm] = useConfirm({
    title: 'Delete Accounts',
    message:
      'Are you sure you want to delete all this account? This will also delete all the transactions related to it.',
  });

  const handleDelete = async (ids: string[]) => {
    const ok = await confirm();
    if (!ok) return;
    deleteMutation.mutate({ ids });
  };

  const handleAddAccount = () => {
    if (!countData) return;
    const isFreePlanCompleted = countData.accountCount >= MAX_FREE_ACCOUNT;
    const isProPlanCompleted = countData.accountCount >= MAX_PRO_ACCOUNT;

    if (plan === 'free' && isFreePlanCompleted) {
      toast.info('Please upgrade  your plan to create more accounts');
      setPlanModalOpen(true);
      return;
    }

    if (plan === 'pro' && isProPlanCompleted) {
      toast.info('Please upgrade  your plan to create more accounts');
      setPlanModalOpen(true);
      return;
    }

    setAccountOpenModal(true);
  };

  if (accountQuery.isLoading) {
    return (
      <Card className="border mb-10 border-primary max-w-screen-xl mx-5  lg:mx-auto shadow-md p-4  mt-[-140px]">
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
      <Card className="border border-primary  max-w-screen-xl mx-5 lg:mx-auto shadow-md p-4 mt-[-140px]">
        <CardHeader className="flex flex-col sm:flex-row gap-y-1 items-center justify-between">
          <CardTitle className="text-2xl text-center sm:text-left font-semibold">
            Accounts page
          </CardTitle>
          <Button
            disabled={isLoadingCount || deleteMutation.isPending}
            onClick={handleAddAccount}
            className="w-full sm:w-auto"
          >
            <div className="flex items-center">
              <Plus className=" size-4 text-white" />
              <span className="ml-2 text-white">Add new</span>
            </div>
          </Button>
        </CardHeader>
        <CardContent>
          <AccountsTable
            data={accountData}
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
