'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NextPage } from 'next';
import { insertCategoriesSchema } from '@/db/schema';
import { Trash } from 'lucide-react';
import { convertAmountToMiliUnit } from '@/lib/utils';

const formSchema = insertCategoriesSchema.pick({ name: true, budget: true });
type FormValues = z.infer<typeof formSchema>;

interface Props {
  id?: string;
  defaultValue?: FormValues;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const CategoryForm: NextPage<Props> = ({
  id,
  defaultValue,
  onSubmit,
  onDelete,
  disabled,
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValue,
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit({ ...values, budget: convertAmountToMiliUnit(values.budget) });
  };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  required
                  className="h-10"
                  disabled={disabled}
                  type="text"
                  placeholder="eg. Food, Grocery, Garments"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>Budget</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  required
                  className="h-10"
                  disabled={disabled}
                  step="0.01"
                  type="number"
                  placeholder="set a monthly budget for this category"
                  min={99}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value) {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button size={'lg'} className="w-full mt-8 mb-2" disabled={disabled} type="submit">
          {id ? 'Update category' : 'Create category'}
        </Button>
      </form>
      {id && (
        <Button
          size={'lg'}
          variant={'outline'}
          className="w-full"
          disabled={disabled}
          onClick={handleDelete}
        >
          <div className="flex items-center gap-2">
            <Trash className="size-4 " />
            <span>Delete Category</span>
          </div>
        </Button>
      )}
    </Form>
  );
};

export default CategoryForm;
