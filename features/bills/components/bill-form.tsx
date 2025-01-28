'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Switch } from '@/components/ui/switch';

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
import { insertBillSchema } from '@/db/schema';
import { Trash } from 'lucide-react';
import DatePicker from '@/components/global/date-picker';
import BillTypeDropdown from './bill-type-dropdown';
import BillStatusDropdown from './bill-status-dropdown';
import { convertAmountToMiliUnit } from '@/lib/utils';

const formSchema = insertBillSchema.omit({ id: true, userId: true, createdAt: true });
type FormValues = z.infer<typeof formSchema>;

interface Props {
  id?: string;
  defaultValue?: FormValues;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const BillForm: NextPage<Props> = ({ id, defaultValue, onSubmit, onDelete, disabled }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValue,
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit({ ...values, amount: convertAmountToMiliUnit(values.amount) });
  };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-y-10">
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
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  required
                  className="h-10"
                  disabled={disabled}
                  type="number"
                  step="0.01"
                  placeholder="Enter Due"
                  min={0}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 0) {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <DatePicker disabled={disabled} value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <BillStatusDropdown
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bill Type</FormLabel>
              <FormControl>
                <BillTypeDropdown
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remind"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Notify me before Due Date</FormLabel>
              <Switch
                id="airplane-mode"
                onCheckedChange={field.onChange}
                checked={field.value}
                disabled={disabled}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button size={'lg'} className="w-full mt-4" disabled={disabled} type="submit">
          {id ? 'Update Bill' : 'Create Bill'}
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
            <span>Delete Bill</span>
          </div>
        </Button>
      )}
    </Form>
  );
};

export default BillForm;
