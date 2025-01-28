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
import { useCreateCategoryStore } from '../hooks/create-category-store';
import { useCreateCategory } from '../actions';
import CategoryForm from './category-form';

const formSchema = insertCategoriesSchema.pick({ name: true, budget: true });
type FormValues = z.infer<typeof formSchema>;

const NewCategorySheet = () => {
  const { open, setOpen } = useCreateCategoryStore();
  const createMutation = useCreateCategory();
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
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold mt-2 text-black dark:text-white">
            New Category
          </SheetTitle>
          <SheetDescription className="font-normal text-md">
            Create a new category to track your transactions.
          </SheetDescription>
        </SheetHeader>
        <CategoryForm
          defaultValue={{ name: '', budget: 0 }}
          disabled={createMutation.isPending}
          onSubmit={handleSubmit}
        />
      </SheetContent>
    </Sheet>
  );
};

export default NewCategorySheet;
