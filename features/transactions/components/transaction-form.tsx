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
import { Trash } from 'lucide-react';
import { insertTransactionsSchema } from '@/db/schema';
import SelectInput from '@/components/global/select-input';
import DatePicker from '@/components/global/date-picker';
import { Textarea } from '@/components/ui/textarea';
import AmountInput from '@/components/global/currency-input';
import { convertAmountToMiliUnit } from '@/lib/utils';

const formSchema = z.object({
  amount: z.string().min(1, { message: 'amount is required' }),
  payee: z.string().min(1, { message: 'amount is required' }),
  date: z.coerce.date(),
  notes: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  accountId: z.string(),
});

const CURRENCY_SYMBOL = '₹';
const apiSchema = insertTransactionsSchema.omit({ id: true, archieve: true });

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>;

interface Props {
  id?: string;
  defaultValue?: FormValues;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  categoryOption?: { label: string; value: string }[];
  accountOption?: { label: string; value: string }[];
  onCreateCategory?: (name: string) => void;
  onCreateAccount?: (name: string) => void;
}

const TransactionForm: NextPage<Props> = ({
  id,
  defaultValue,
  onSubmit,
  onDelete,
  disabled,
  categoryOption,
  accountOption,
  onCreateAccount,
  onCreateCategory,
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValue,
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      ...values,
      amount: convertAmountToMiliUnit(parseFloat(values.amount)),
      creationType: 'local',
    });
  };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-y-10">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <DatePicker disabled={disabled} value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <FormControl>
                <SelectInput
                  options={accountOption}
                  placeholder="Select an Account"
                  onChange={field.onChange}
                  onCreate={onCreateAccount}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <SelectInput
                  options={categoryOption}
                  placeholder="Select a Category"
                  onChange={field.onChange}
                  onCreate={onCreateCategory}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="payee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payee</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  type="text"
                  placeholder="Add a payee"
                  {...field}
                  value={field.value || ''}
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
                <AmountInput
                  placeholder="Enter an Amount"
                  prefix={CURRENCY_SYMBOL}
                  onChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={disabled}
                  placeholder="Optional notes.."
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button size={'lg'} className="w-full mt-4" disabled={disabled} type="submit">
          {id ? 'Update Transaction' : 'Create Transaction'}
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
            <span>Delete Transaction</span>
          </div>
        </Button>
      )}
    </Form>
  );
};

export default TransactionForm;
