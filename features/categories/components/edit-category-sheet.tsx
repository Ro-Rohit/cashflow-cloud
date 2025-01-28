'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { insertCategoriesSchema } from '@/db/schema';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import useConfirm from '@/hooks/use-confirm';
import { useEditCategoryStore } from '@/features/categories/hooks/edit-category-store';
import { useDeleteCategory, useGetCategory, useUpdateCategory } from '../actions';
import CategoryForm from './category-form';

const formSchema = insertCategoriesSchema.pick({ name: true, budget: true });
type FormValues = z.infer<typeof formSchema>;

const EditCategorySheet = () => {
  const { open, setOpen, id } = useEditCategoryStore();
  const [ConfirmDialog, confirm] = useConfirm({
    title: 'Delete Category',
    message: 'Are you sure you want to delete this category?',
  });

  const categoryQuery = useGetCategory(id);
  const categoryData = categoryQuery.data;
  const updateMutation = useUpdateCategory(id);
  const deleteMutation = useDeleteCategory(id);

  const handleSubmit = (values: FormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) return;
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  const isLoading = updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={'right'}>
          <SheetHeader className="mt-4">
            <SheetTitle className="dark:text-white text-black text-xl font-semibold">
              Edit Category
            </SheetTitle>
            <SheetDescription>Create a new category to track your transactions.</SheetDescription>
          </SheetHeader>
          {categoryQuery.isLoading ? (
            <div className="absolute inset-0 flex items-center ">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <CategoryForm
              id={id}
              defaultValue={{ name: categoryData?.name ?? '', budget: categoryData?.budget ?? 0 }}
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

export default EditCategorySheet;
