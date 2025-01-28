'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { z } from 'zod';
import { useCreateTransactionStore } from '../hooks/create-transaction-store';
import { useCreateTransaction } from '../actions';
import { useCreateAccount, useGetAccounts } from '@/features/accounts/actions';
import { useCreateCategory, useGetCategories } from '@/features/categories/actions';
import { insertTransactionsSchema } from '@/db/schema';
import TransactionForm from './transaction-form';
import { Loader2 } from 'lucide-react';

const formSchema = insertTransactionsSchema.omit({ id: true, archieve: true });
type FormValues = z.infer<typeof formSchema>;

const NewTransactionSheet = () => {
  const { open, setOpen } = useCreateTransactionStore();
  const createTransactionMutation = useCreateTransaction();
  const createAccountMutation = useCreateAccount();
  const createCategoryMutation = useCreateCategory();

  const accountQuery = useGetAccounts();
  const categoryQuery = useGetCategories();
  const accountData = accountQuery.data;
  const categoryData = categoryQuery.data;

  const onCreateCategory = (name: string) => {
    createCategoryMutation.mutate({ name: name, budget: 100 });
  };
  const onCreateAccount = (name: string) => {
    createAccountMutation.mutate({ name });
  };

  const categoryOption = (categoryData ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const accountOption = (accountData ?? []).map((account) => ({
    label: account.name,
    value: account.id,
  }));

  const handleSubmit = (values: FormValues) => {
    createTransactionMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  const isLoading = accountQuery.isLoading || categoryQuery.isLoading;
  const disabled =
    createTransactionMutation.isPending ||
    createAccountMutation.isPending ||
    createCategoryMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side={'right'}>
        <SheetHeader className="mb-10">
          <SheetTitle className="dark:text-white text-xl font-semibold text-black">
            New Transaction
          </SheetTitle>
          <SheetDescription className="font-normal text-md">
            Add a new transaction.
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center ">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <TransactionForm
            categoryOption={categoryOption}
            accountOption={accountOption}
            onCreateAccount={onCreateAccount}
            onCreateCategory={onCreateCategory}
            disabled={disabled}
            onSubmit={handleSubmit}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NewTransactionSheet;
