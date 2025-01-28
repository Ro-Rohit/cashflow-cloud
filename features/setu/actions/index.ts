import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { convertAmountFromMiliUnit, honoClient } from '@/lib/utils';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type createResponseType = InferResponseType<
  (typeof honoClient.api.setu)['consent']['$post'],
  201
>['data'];

export const useCreateConsent = () => {
  const mutation = useMutation<createResponseType, Error, void>({
    mutationKey: ['create-consent'],
    mutationFn: async () => {
      const res = await honoClient.api.setu['consent'].$post();
      if (!res || res.status !== 201) {
        throw new Error('Failed to create consent');
      }
      const { url } = await res.json();
      return url;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (error: Error) => {
      toast.error('Failed to connect to bank.');
    },
  });

  return mutation;
};
