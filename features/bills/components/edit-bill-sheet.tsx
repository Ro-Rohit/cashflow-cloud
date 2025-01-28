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
import { useEditBillStore } from '../hooks/edit-bill-store';
import { Loader2 } from 'lucide-react';
import useConfirm from '@/hooks/use-confirm';
import { useDeleteBills, useGetBill, useUpdateBill } from '../actions';
import { useGetCategories } from '@/features/categories/actions';
import { useCreateCategory } from '../../categories/actions/index';

const formSchema = insertBillSchema.omit({ id: true, userId: true, createdAt: true });
type FormValues = z.infer<typeof formSchema>;

const EditBillSheet = () => {
  const { open, setOpen, id } = useEditBillStore();
  const [ConfirmDialog, confirm] = useConfirm({
    title: 'Delete Bill',
    message: 'Are you sure you want to delete this bill?',
  });
  const billQuery = useGetBill(id);
  const bill = billQuery.data;
  const updateMutation = useUpdateBill(id);
  const deleteMutation = useDeleteBills(id);

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
              Edit Bill
            </SheetTitle>
            <SheetDescription className="font-normal text-md">
              edit a bill to track your expenses.
            </SheetDescription>
          </SheetHeader>
          {billQuery.isLoading ? (
            <div className="absolute inset-0 flex items-center ">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <BillForm
              id={id}
              defaultValue={{
                ...bill,
                dueDate: bill?.dueDate ? new Date(bill.dueDate) : new Date(),
              }}
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

export default EditBillSheet;
