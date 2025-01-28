'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import useConfirm from '@/hooks/use-confirm';
import { insertTransactionsSchema } from '@/db/schema';
import { useEditTransactionStore } from '../hooks/edit-transaction-store';
import { useDeleteTransaction, useGetTransaction, useUpdateTransaction } from '../actions';
import { useCreateAccount, useGetAccounts } from '@/features/accounts/actions';
import { useCreateCategory, useGetCategories } from '@/features/categories/actions';
import TransactionForm from './transaction-form';

const formSchema = insertTransactionsSchema.omit({ id: true, archieve: true });
type FormValues = z.infer<typeof formSchema>;

const EditTransactionSheet = () => {
  const { open, setOpen, id } = useEditTransactionStore();
  const [ConfirmDialog, confirm] = useConfirm({
    title: 'Delete Transaction',
    message: 'Are you sure you want to delete this transaction?',
  });
  const createAccountMutation = useCreateAccount();
  const createCategoryMutation = useCreateCategory();

  const updateMutation = useUpdateTransaction(id);
  const deleteMutation = useDeleteTransaction(id);

  const transactionQuery = useGetTransaction(id);
  const transactionData = transactionQuery.data;
  const accountQuery = useGetAccounts();
  const categoryQuery = useGetCategories();
  const accountData = accountQuery.data;
  const categoryData = categoryQuery.data;

  const onCreateCategory = (name: string) => {
    createCategoryMutation.mutate({ name });
  };
  const onCreateAccount = (name: string) => {
    createAccountMutation.mutate({ name });
  };

  const categoryOption = (categoryData ?? []).map((category: any) => ({
    label: category.name,
    value: category.id,
  }));

  const accountOption = (accountData ?? []).map((account: any) => ({
    label: account.name,
    value: account.id,
  }));

  const handleSubmit = (values: FormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  const handleDelete = async () => {
    const ok = await confirm();
    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          setOpen(false);
        },
      });
    }
  };

  const disabled =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    createAccountMutation.isPending ||
    createCategoryMutation.isPending;
  const isLoading = accountQuery.isLoading || categoryQuery.isLoading || transactionQuery.isLoading;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={'right'}>
          <SheetHeader>
            <SheetTitle className="dark:text-white text-xl font-semibold text-black">
              Edit Transaction
            </SheetTitle>
            <SheetDescription className="font-normal text-md">
              edit a transaction to track your transactions.
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center ">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TransactionForm
              id={id}
              accountOption={accountOption}
              categoryOption={categoryOption}
              onCreateAccount={onCreateAccount}
              onCreateCategory={onCreateCategory}
              defaultValue={{
                accountId: transactionData?.accountId ?? '',
                categoryId: transactionData?.categoryId ?? '',
                payee: transactionData?.payee ?? '',
                notes: transactionData?.notes ?? '',
                amount: transactionData?.amount.toString() ?? '',
                date: transactionData?.date ? new Date(transactionData.date) : new Date(),
              }}
              onDelete={handleDelete}
              disabled={disabled}
              onSubmit={handleSubmit}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EditTransactionSheet;
