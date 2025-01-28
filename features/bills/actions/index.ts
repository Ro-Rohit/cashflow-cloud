'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { convertAmountFromMiliUnit, honoClient } from '@/lib/utils';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';


export const useGetBills = () => {
  const params = useSearchParams();
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const accountId = params.get('accountId') || '';
  const query = useQuery({
    queryKey: ['bills', {accountId, to, from} ],
    queryFn: async () => {
      const res = await honoClient.api.bills.$get({ query: { from, to, accountId } });
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch bills');
      }
      const { data } = await res.json();
      return data.map((item) => ({
        ...item,
        amount: convertAmountFromMiliUnit(item.amount),
      }));
    },
    staleTime: 5 * 1000 * 60,
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
  });
  return query;
};

export const useGetBill = (id?: string) =>
  useQuery({
    enabled: !!id,
    queryKey: ['bill', { id }],
    queryFn: async () => {
      const res = await honoClient.api.bills[':id'].$get({ param: { id } });
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch bill');
      }
      const { data } = await res.json();
      return {
        ...data,
        amount: convertAmountFromMiliUnit(data.amount),
      };
    },
    staleTime: 5 * 1000 * 60,
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
  });

type createResponseType = InferResponseType<typeof honoClient.api.bills.$post, 201>;
type createRequestType = InferRequestType<typeof honoClient.api.bills.$post>['json'];
export const useCreateBill = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<createResponseType, Error, createRequestType>({
    mutationFn: async (json) => {
      const res = await honoClient.api.bills.$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to create bill');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });
      toast.success('Bill created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create bill');
    },
  });
  return mutation;
};

type createBulkResponseType = InferResponseType<
  (typeof honoClient.api.bills)['bulk-create']['$post'],
  201
>;
type createBulkRequestType = InferRequestType<
  (typeof honoClient.api.bills)['bulk-create']['$post']
>['json'];
export const useBulkCreateBills = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<createBulkResponseType, Error, createBulkRequestType>({
    mutationFn: async (json) => {
      const res = await honoClient.api.bills['bulk-create'].$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to create bulk bills');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill-summary'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });

      toast.success('bills created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create bills');
    },
  });
  return mutation;
};

type patchResponseType = InferResponseType<(typeof honoClient.api.bills)[':id']['$patch'], 200>;
type patchRequestType = InferRequestType<(typeof honoClient.api.bills)[':id']['$patch']>['json'];
export const useUpdateBill = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<patchResponseType, Error, patchRequestType>({
    mutationKey: ['bills', { id }],
    mutationFn: async (json) => {
      const res = await honoClient.api.bills[':id'].$patch({ json, param: { id: id } });
      if (!res || res.status !== 200) {
        throw new Error('Failed to update bill');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', { id }] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      toast.success('Bill updated successfully');
    },
    onError: () => {
      toast.error('Failed to updated bill');
    },
  });
  return mutation;
};

type deleteResponseType = InferResponseType<(typeof honoClient.api.bills)[':id']['$delete'], 201>;
export const useDeleteBills = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<deleteResponseType, Error>({
    mutationKey: ['bills', { id }],
    mutationFn: async () => {
      const res = await honoClient.api.bills[':id'].$delete({ param: { id: id } });
      if (!res || res.status !== 201) {
        throw new Error('Failed to delete Bill');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', { id }] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });

      toast.success('Bill deleted successfully');
    },
    onError: () => {
      toast.error('Failed to deleted bill');
    },
  });
  return mutation;
};

type bulkDeleteResponseType = InferResponseType<
  (typeof honoClient.api.bills)['bulk-delete']['$post'],
  201
>;
type bulkDeleteRequestType = InferRequestType<
  (typeof honoClient.api.bills)['bulk-delete']['$post']
>['json'];
export const useBulkDeleteBills = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<bulkDeleteResponseType, Error, bulkDeleteRequestType>({
    mutationKey: ['bills', 'bulk-delete'],
    mutationFn: async (json) => {
      const res = await honoClient.api.bills['bulk-delete'].$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to bulk delete bills');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill-summary'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });

      toast.success('bills deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete Bills');
    },
  });
  return mutation;
};
