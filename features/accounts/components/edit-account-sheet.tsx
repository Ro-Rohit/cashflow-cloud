'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import AccountForm from './account-form';
import { insertAccountsSchema } from '@/db/schema';
import { z } from 'zod';
import { useDeleteAccount, useGetAccount, useUpdateAccount } from '../actions';
import { useEditAccountStore } from '../hooks/edit-account-store';
import { Loader2 } from 'lucide-react';
import useConfirm from '@/hooks/use-confirm';

const formSchema = insertAccountsSchema.pick({ name: true, creationType: true });
type FormValues = z.infer<typeof formSchema>;

const EditAccountSheet = () => {
  const { open, setOpen, id } = useEditAccountStore();
  const [ConfirmDialog, confirm] = useConfirm({
    title: 'Delete Account',
    message: 'Are you sure you want to delete this account?',
  });
  const accountQuery = useGetAccount(id);
  const account = accountQuery.data;
  const updateMutation = useUpdateAccount(id);
  const deleteMutation = useDeleteAccount(id);

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

  const isLoading = updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={'right'}>
          <SheetHeader>
            <SheetTitle className="dark:text-white mt-2 text-xl font-semibold text-black">
              Edit Account
            </SheetTitle>
            <SheetDescription className="font-normal text-md">
              edit a account to track your transactions.
            </SheetDescription>
          </SheetHeader>
          {accountQuery.isLoading ? (
            <div className="absolute inset-0 flex items-center ">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <AccountForm
              id={id}
              defaultValue={account}
              onDelete={handleDelete}
              disabled={isLoading}
              onSubmit={handleSubmit}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EditAccountSheet;
