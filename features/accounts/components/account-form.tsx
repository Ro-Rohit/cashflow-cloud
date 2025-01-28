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
import { insertAccountsSchema } from '@/db/schema';
import { Trash } from 'lucide-react';

const formSchema = insertAccountsSchema.pick({ name: true, creationType: true });
type FormValues = z.infer<typeof formSchema>;

interface Props {
  id?: string;
  defaultValue?: FormValues;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const AccountForm: NextPage<Props> = ({
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
    onSubmit({ ...values, creationType: 'local' });
  };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
                  placeholder="eg. Cash, Bank, Credit Card"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button size={'lg'} className="w-full mt-4" disabled={disabled} type="submit">
          {id ? 'Update Account' : 'Create account'}
        </Button>
      </form>
      {id && (
        <Button
          size={'lg'}
          variant={'outline'}
          className="w-full mt-4"
          disabled={disabled}
          onClick={handleDelete}
        >
          <div className="flex items-center gap-2">
            <Trash className="size-4 " />
            <span>Delete Account</span>
          </div>
        </Button>
      )}
    </Form>
  );
};

export default AccountForm;
