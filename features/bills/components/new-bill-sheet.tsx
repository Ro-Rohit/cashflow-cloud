'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import BillForm from './bill-form';
import { insertBillSchema } from '@/db/schema';
import { z } from 'zod';
import { useCreateBillStore } from '../hooks/create-bill-store';
import { useCreateBill } from '../actions';
import { useCreateCategory, useGetCategories } from '@/features/categories/actions';

const formSchema = insertBillSchema.omit({ id: true, userId: true, createdAt: true });
type FormValues = z.infer<typeof formSchema>;

const NewBillSheet = () => {
  const { open, setOpen } = useCreateBillStore();
  const createMutation = useCreateBill();

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
            New Bill
          </SheetTitle>
          <SheetDescription className="font-normal text-md">
            Create a new bill to track your expenses.
          </SheetDescription>
        </SheetHeader>
        <BillForm disabled={createMutation.isPending} onSubmit={handleSubmit} />
      </SheetContent>
    </Sheet>
  );
};

export default NewBillSheet;
