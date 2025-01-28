'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { convertAmountFromMiliUnit, honoClient } from '@/lib/utils';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

export const useGetTransactions = () => {
  const params = useSearchParams();
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const accountId = params.get('accountId') || '';

  const query = useQuery({
    queryKey: ['transactions', { from, to, accountId }],
    queryFn: async (query) => {
      const res = await honoClient.api.transactions.$get({ query: { from, to, accountId } });
      if (!res.ok || res.status !== 200) {
        throw new Error('Failed to fetch transactions');
      }
      const { data } = await res.json();
      return data.map((transaction: any) => ({
        ...transaction,
        amount: convertAmountFromMiliUnit(transaction.amount),
      }));
    },
    staleTime: 5 * 1000 * 60,
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
  });
  return query;
};

export const useGetTransaction = (id: string) =>
  useQuery({
    enabled: !!id,
    queryKey: ['transaction', { id }],
    queryFn: async () => {
      const res = await honoClient.api.transactions[':id'].$get({ param: { id } });
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch transaction');
      }
      const { data } = await res.json();
      return {
        ...data,
        amount: convertAmountFromMiliUnit(data.amount),
      };
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
  });

type createResponseType = InferResponseType<typeof honoClient.api.transactions.$post, 201>;
type createRequestType = InferRequestType<typeof honoClient.api.transactions.$post>['json'];
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<createResponseType, Error, createRequestType>({
    mutationFn: async (json) => {
      const res = await honoClient.api.transactions.$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to create transactions');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });
      queryClient.invalidateQueries({ queryKey: ['top-income-transactons'] });
      queryClient.invalidateQueries({ queryKey: ['top-expenses-transactons'] });
      queryClient.invalidateQueries({ queryKey: ['top-categories-income'] });
      queryClient.invalidateQueries({ queryKey: ['top-categories-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['active-periods'] });
      queryClient.invalidateQueries({ queryKey: ['categories-budget'] });
      toast.success('Transactions created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create transactions');
    },
  });
  return mutation;
};

type createBulkResponseType = InferResponseType<
  (typeof honoClient.api.transactions)['bulk-create']['$post'],
  201
>;
type createBulkRequestType = InferRequestType<
  (typeof honoClient.api.transactions)['bulk-create']['$post']
>['json'];
export const useBulkCreateTransactions = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<createBulkResponseType, Error, createBulkRequestType>({
    mutationFn: async (json) => {
      const res = await honoClient.api.transactions['bulk-create'].$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to create transaction');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });
      queryClient.invalidateQueries({ queryKey: ['top-income-transactons'] });
      queryClient.invalidateQueries({ queryKey: ['top-expenses-transactons'] });
      queryClient.invalidateQueries({ queryKey: ['top-categories-income'] });
      queryClient.invalidateQueries({ queryKey: ['top-categories-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['active-periods'] });
      queryClient.invalidateQueries({ queryKey: ['categories-budget'] });

      toast.success('Transactions created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create transactions');
    },
  });
  return mutation;
};

type patchResponseType = InferResponseType<
  (typeof honoClient.api.transactions)[':id']['$patch'],
  200
>;
type patchRequestType = InferRequestType<
  (typeof honoClient.api.transactions)[':id']['$patch']
>['json'];
export const useUpdateTransaction = (id: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<patchResponseType, Error, patchRequestType>({
    mutationKey: ['transaction', { id }],
    mutationFn: async (json) => {
      const res = await honoClient.api.transactions[':id'].$patch({ json, param: { id: id } });
      if (!res || res.status !== 200) {
        throw new Error('Failed to update transaction');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', { id }] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['top-income-transactons'] });
      queryClient.invalidateQueries({ queryKey: ['top-expenses-transactons'] });
      queryClient.invalidateQueries({ queryKey: ['top-categories-income'] });
      queryClient.invalidateQueries({ queryKey: ['top-categories-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['active-periods'] });
      queryClient.invalidateQueries({ queryKey: ['categories-budget'] });

      toast.success('Transaction updated successfully');
    },
    onError: () => {
      toast.error('Failed to updated transaction');
    },
  });
  return mutation;
};

type deleteResponseType = InferResponseType<
  (typeof honoClient.api.transactions)[':id']['$delete'],
  201
>;
export const useDeleteTransaction = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<deleteResponseType, Error>({
    mutationKey: ['transaction', { id }],
    mutationFn: async () => {
      const res = await honoClient.api.accounts[':id'].$delete({ param: { id: id } });
      if (!res || res.status !== 201) {
        throw new Error('Failed to delete transaction');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', { id }] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });
      queryClient.invalidateQueries({ queryKey: ['top-income-transactons'] });
      queryClient.invalidateQueries({ queryKey: ['top-expenses-transactons'] });
      queryClient.invalidateQueries({ queryKey: ['top-categories-income'] });
      queryClient.invalidateQueries({ queryKey: ['top-categories-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['active-periods'] });
      queryClient.invalidateQueries({ queryKey: ['categories-budget'] });

      toast.success('Transaction deleted successfully');
    },
    onError: () => {
      toast.error('Failed to deleted transaction');
    },
  });
  return mutation;
};

type bulkDeleteResponseType = InferResponseType<
  (typeof honoClient.api.transactions)['bulk-delete']['$post'],
  201
>;
type bulkDeleteRequestType = InferRequestType<
  (typeof honoClient.api.transactions)['bulk-delete']['$post']
>['json'];
export const useBulkDeleteTransactions = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<bulkDeleteResponseType, Error, bulkDeleteRequestType>({
    mutationKey: ['transactions', 'bulk-delete'],
    mutationFn: async (json) => {
      const res = await honoClient.api.transactions['bulk-delete'].$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to bulk delete transactions');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });
      queryClient.invalidateQueries({ queryKey: ['top-income-transactons'] });
      queryClient.invalidateQueries({ queryKey: ['top-expenses-transactons'] });
      queryClient.invalidateQueries({ queryKey: ['top-categories-income'] });
      queryClient.invalidateQueries({ queryKey: ['top-categories-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['active-periods'] });
      queryClient.invalidateQueries({ queryKey: ['categories-budget'] });
      toast.success('Transactions deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete transactions');
    },
  });
  return mutation;
};
