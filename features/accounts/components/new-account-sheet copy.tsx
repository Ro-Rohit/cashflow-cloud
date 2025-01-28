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
import { useCreateAccount } from '../actions';
import { useCreateAccountStore } from '../hooks/create-account-store';

const formSchema = insertAccountsSchema.pick({ name: true, creationType: true });
type FormValues = z.infer<typeof formSchema>;

const NewAccountSheet = () => {
  const { open, setOpen } = useCreateAccountStore();
  const createMutation = useCreateAccount();
  const handleSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side={'right'}>
        <SheetHeader className="mb-10">
          <SheetTitle className="dark:text-white mt-2 text-xl font-semibold text-black">
            New Account
          </SheetTitle>
          <SheetDescription className="font-normal text-md">
            Create a new account to track your transactions.
          </SheetDescription>
        </SheetHeader>
        <AccountForm
          defaultValue={{ name: '' }}
          disabled={createMutation.isPending}
          onSubmit={handleSubmit}
        />
      </SheetContent>
    </Sheet>
  );
};

export default NewAccountSheet;
