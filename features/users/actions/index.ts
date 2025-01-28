'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient } from '@/lib/utils';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

export const useGetUser = () =>
  useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await honoClient.api.users.$get();
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch user');
      }
      const { data } = await res.json();
      return { ...data, dob: new Date(data.dob) };
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false,
  });

type createResponseType = InferResponseType<typeof honoClient.api.users.$post, 201>;
type createRequestType = InferRequestType<typeof honoClient.api.users.$post>['json'];
export const useCreateUsers = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<createResponseType, Error, createRequestType>({
    mutationKey: ['create-user'],
    mutationFn: async (json) => {
      const res = await honoClient.api.users.$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to create users account');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast.success('User account created successfully');
      window.location.reload();
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      toast.error('Failed to create user account');
    },
  });
  return mutation;
};

type patchResponseType = InferResponseType<(typeof honoClient.api.users)['$patch'], 200>;
type patchRequestType = InferRequestType<(typeof honoClient.api.users)['$patch']>['json'];
export const useUpdateUser = (email?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<patchResponseType, Error, patchRequestType>({
    mutationKey: ['accounts', { email }],
    mutationFn: async (json) => {
      const res = await honoClient.api.users.$patch({ json });
      if (!res || res.status !== 200) {
        throw new Error('Failed to update User profile');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('User profle updated successfully');
    },
    onError: () => {
      toast.error('Failed to updated user profile');
    },
  });
  return mutation;
};

type deleteResponseType = InferResponseType<
  (typeof honoClient.api.users)['delete-user']['$post'],
  204
>;
type deleteRequestType = InferRequestType<
  (typeof honoClient.api.users)['delete-user']['$post']
>['json'];
export const useDeleteUsers = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<deleteResponseType, Error, deleteRequestType>({
    mutationKey: ['create-user'],
    mutationFn: async (json) => {
      const res = await honoClient.api.users['delete-user'].$post({ json });
      if (!res || res.status !== 200) {
        throw new Error('Failed to delete user account');
      }
      return await res.json();
    },
    onSuccess: () => {
      window.location.href = `${process.env.NEXT_PUBLIC_APP_URl}/`;
      toast.success('User account deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete user account');
    },
  });
  return mutation;
};

type createTokenRequestType = InferRequestType<
  (typeof honoClient.api.users)['create-and-send-token']['$post']
>['json'];

type createTokenResponseType = InferResponseType<
  (typeof honoClient.api.users)['create-and-send-token']['$post'],
  201
>['data'];
export const useCreateVerificationToken = () => {
  const mutation = useMutation<createTokenResponseType, Error, createTokenRequestType>({
    mutationKey: ['create-verification-token'],
    mutationFn: async (json) => {
      const res = await honoClient.api.users['create-and-send-token'].$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to create verification token');
      }
      const { data } = await res.json();
      return data;
    },
    onError: (error) => {
      toast.error('Failed to send verification token');
    },
  });
  return mutation;
};

type verifyTokenResponseType = InferResponseType<
  (typeof honoClient.api.users)['verify-token']['$post'],
  201
>;
type verifyTokenRequestType = InferRequestType<
  (typeof honoClient.api.users)['verify-token']['$post']
>['json'];
export const useVerifyToken = () => {
  const mutation = useMutation<verifyTokenResponseType, Error, verifyTokenRequestType>({
    mutationKey: ['create-verification-token'],
    mutationFn: async (json) => {
      const res = await honoClient.api.users['verify-token'].$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to verify token');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast.success('code verified successfully');
    },
    onError: (error) => {
      toast.error('Failed to verify code');
    },
  });
  return mutation;
};
