'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient } from '@/lib/utils';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

export const useGetAccounts = () =>
  useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await honoClient.api.accounts.$get();
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch accounts');
      }
      const { data } = await res.json();
      return data;
    },
    staleTime: 5 * 1000 * 60,
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
  });

export const useGetAccount = (id?: string) =>
  useQuery({
    enabled: !!id,
    queryKey: ['accounts', { id }],
    queryFn: async () => {
      const res = await honoClient.api.accounts[':id'].$get({ param: { id } });
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch accounts');
      }
      const { data } = await res.json();
      return data;
    },
    staleTime: 5 * 1000 * 60,
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
  });

type createResponseType = InferResponseType<typeof honoClient.api.accounts.$post, 201>;
type createRequestType = InferRequestType<typeof honoClient.api.accounts.$post>['json'];
export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<createResponseType, Error, createRequestType>({
    mutationFn: async (json) => {
      const res = await honoClient.api.accounts.$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to create account');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });

      toast.success('Account created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create account');
    },
  });
  return mutation;
};

type patchResponseType = InferResponseType<(typeof honoClient.api.accounts)[':id']['$patch'], 200>;
type patchRequestType = InferRequestType<(typeof honoClient.api.accounts)[':id']['$patch']>['json'];
export const useUpdateAccount = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<patchResponseType, Error, patchRequestType>({
    mutationKey: ['accounts', { id }],
    mutationFn: async (json) => {
      const res = await honoClient.api.accounts[':id'].$patch({ json, param: { id: id } });
      if (!res || res.status !== 200) {
        throw new Error('Failed to update account');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', { id }] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });

      toast.success('Account updated successfully');
    },
    onError: () => {
      toast.error('Failed to updated account');
    },
  });
  return mutation;
};

type deleteResponseType = InferResponseType<
  (typeof honoClient.api.accounts)[':id']['$delete'],
  201
>;
export const useDeleteAccount = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<deleteResponseType, Error>({
    mutationKey: ['accounts', { id }],
    mutationFn: async () => {
      const res = await honoClient.api.accounts[':id'].$delete({ param: { id: id } });
      if (!res || res.status !== 201) {
        throw new Error('Failed to delete account');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', { id }] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });

      toast.success('Account deleted successfully');
    },
    onError: () => {
      toast.error('Failed to deleted account');
    },
  });
  return mutation;
};

type bulkDeleteResponseType = InferResponseType<
  (typeof honoClient.api.accounts)['bulk-delete']['$post'],
  201
>;
type bulkDeleteRequestType = InferRequestType<
  (typeof honoClient.api.accounts)['bulk-delete']['$post']
>['json'];
export const useBulkDeleteAccount = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<bulkDeleteResponseType, Error, bulkDeleteRequestType>({
    mutationKey: ['accounts', 'bulk-delete'],
    mutationFn: async (json) => {
      const res = await honoClient.api.accounts['bulk-delete'].$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to bulk delete accounts');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });

      toast.success('Accounts deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete accounts');
    },
  });
  return mutation;
};
