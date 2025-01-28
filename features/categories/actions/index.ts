import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { convertAmountFromMiliUnit, honoClient } from '@/lib/utils';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

export const useGetCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await honoClient.api.categories.$get();
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch categories');
      }
      const { data } = await res.json();
      return data.map((category: any) => ({
        ...category,
        budget: convertAmountFromMiliUnit(category.budget),
      }));
    },
    staleTime: 5 * 1000 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

export const useGetCategory = (id?: string) =>
  useQuery({
    enabled: !!id,
    queryKey: ['category', { id }],
    queryFn: async () => {
      const res = await honoClient.api.categories[':id'].$get({ param: { id } });
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch category');
      }
      const { data } = await res.json();
      return { ...data, budget: convertAmountFromMiliUnit(data.budget) };
    },
    staleTime: 5 * 1000 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

type createResponseType = InferResponseType<typeof honoClient.api.categories.$post, 201>;
type createRequestType = InferRequestType<typeof honoClient.api.categories.$post>['json'];
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<createResponseType, Error, createRequestType>({
    mutationFn: async (json) => {
      const res = await honoClient.api.categories.$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to create category');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });

      toast.success('Category created successfully');
    },
    onError: () => {
      toast.error('Failed to create category');
    },
  });
  return mutation;
};

type createBulkResponseType = InferResponseType<
  (typeof honoClient.api.categories)['bulk-create']['$post'],
  201
>['data'];
type createBulkRequestType = InferRequestType<
  (typeof honoClient.api.categories)['bulk-create']['$post']
>['json'];
export const useBulkCreateCategories = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<createBulkResponseType, Error, createBulkRequestType>({
    mutationFn: async (json) => {
      const res = await honoClient.api.categories['bulk-create'].$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to create bulk categories');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });
      toast.success('Categories created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create categories');
    },
  });
  return mutation;
};

type patchResponseType = InferResponseType<
  (typeof honoClient.api.categories)[':id']['$patch'],
  200
>;
type patchRequestType = InferRequestType<
  (typeof honoClient.api.categories)[':id']['$patch']
>['json'];
export const useUpdateCategory = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<patchResponseType, Error, patchRequestType>({
    mutationKey: ['category', { id }],
    mutationFn: async (json) => {
      const res = await honoClient.api.categories[':id'].$patch({ json, param: { id: id } });
      if (!res || res.status !== 200) {
        throw new Error('Failed to update category');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category', { id }] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });

      toast.success('Category updated successfully');
    },
    onError: () => {
      toast.error('Failed to updated category');
    },
  });
  return mutation;
};

type deleteResponseType = InferResponseType<
  (typeof honoClient.api.categories)[':id']['$delete'],
  201
>;
export const useDeleteCategory = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<deleteResponseType, Error>({
    mutationKey: ['category', { id }],
    mutationFn: async () => {
      const res = await honoClient.api.categories[':id'].$delete({ param: { id: id } });
      if (!res || res.status !== 201) {
        throw new Error('Failed to delete category');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category', { id }] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });

      toast.success('Category deleted successfully');
    },
    onError: () => {
      toast.error('Failed to deleted category');
    },
  });
  return mutation;
};

type bulkDeleteResponseType = InferResponseType<
  (typeof honoClient.api.categories)['bulk-delete']['$post'],
  201
>;
type bulkDeleteRequestType = InferRequestType<
  (typeof honoClient.api.categories)['bulk-delete']['$post']
>['json'];
export const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<bulkDeleteResponseType, Error, bulkDeleteRequestType>({
    mutationKey: ['categories', 'bulk-delete'],
    mutationFn: async (json) => {
      const res = await honoClient.api.categories['bulk-delete'].$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to bulk delete categories');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['data-count'] });

      toast.success('Categories deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete categories');
    },
  });
  return mutation;
};
