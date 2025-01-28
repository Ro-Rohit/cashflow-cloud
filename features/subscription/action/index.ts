'use client';
import { useMutation, useQuery, QueryClient } from '@tanstack/react-query';
import { honoClient } from '@/lib/utils';
import { InferResponseType, InferRequestType } from 'hono';
import { toast } from 'sonner';

export const useGetDiscounts = () => {
  const query = useQuery({
    queryKey: ['discounts'],
    queryFn: async () => {
      const res = await honoClient.api.subscriptions['discount-codes'].$get();
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch discount List');
      }

      const { data } = await res.json();
      return data.map((discount) => ({
        ...discount,
        startsAt: discount.startsAt ? new Date(discount.startsAt) : undefined,
        expiresAt: discount.expiresAt ? new Date(discount.expiresAt) : undefined,
      }));
    },
    staleTime: 5 * 1000 * 60,
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: true, // Disable refetch on mount
  });

  return query;
};
export const useGetSubscriptionInvoice = () => {
  const query = useQuery({
    queryKey: ['subscription-invoice'],
    queryFn: async () => {
      const res = await honoClient.api.subscriptions['subscription-invoice'].$get();

      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch subscription invoice');
      }

      const { data } = await res.json();
      return data;
    },
    staleTime: 5 * 1000 * 60,
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: true,
  });
  return query;
};

export const useGetActiveSubscriptionById = (subscriptionId?: string) => {
  const query = useQuery({
    queryKey: ['active-subscription', { subscriptionId }],
    enabled: !!subscriptionId,
    queryFn: async () => {
      if (!subscriptionId) {
        throw new Error('Subscription ID is not available');
      }

      const res = await honoClient.api.subscriptions['active-subscription'][':id'].$get({
        param: { id: subscriptionId },
      });

      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch active subscription');
      }

      const { data } = await res.json();

      if (!data) {
        throw new Error('No active subscription found');
      }

      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : undefined,
        renewsAt: new Date(data.renewsAt),
        endsAt: new Date(data.endsAt),
        pausedAt: data.pausedAt ? new Date(data.pausedAt) : undefined,
      };
    },
    staleTime: 5 * 1000 * 60,
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
  });

  return query;
};

type CheckoutResponseType = InferResponseType<
  (typeof honoClient.api.subscriptions)['checkout']['$post'],
  201
>;
type CheckoutRequestType = InferRequestType<
  (typeof honoClient.api.subscriptions)['checkout']['$post']
>['json'];
export const useCheckoutSubscription = () => {
  const queryClient = new QueryClient();
  const query = useMutation<CheckoutResponseType, Error, CheckoutRequestType>({
    mutationKey: ['checkout'],
    mutationFn: async (json) => {
      const res = await honoClient.api.subscriptions['checkout'].$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to  checkout subscription');
      }

      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error('Failed to checkout subscription');
    },
  });

  return query;
};

type CancelResponseType = InferResponseType<
  (typeof honoClient.api.subscriptions)['cancel-subscription']['$post'],
  201
>['data'];
type CancelRequestType = InferRequestType<
  (typeof honoClient.api.subscriptions)['cancel-subscription']['$post']
>['json'];
export const useCancelActiveSubscription = () => {
  const queryClient = new QueryClient();
  const query = useMutation<CancelResponseType, Error, CancelRequestType>({
    mutationKey: ['cancel-subscription'],
    mutationFn: async (json) => {
      const res = await honoClient.api.subscriptions['cancel-subscription'].$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to cancel active subscription');
      }

      const { data } = await res.json();
      return data;
    },
    onSuccess: (data) => {
      toast.success('subscription cancelled successfully.');
      const subscriptionId = data.lemonSqueezyId;
      queryClient.invalidateQueries({ queryKey: ['active-subscription', { subscriptionId }] });
    },
    onError: (error) => {
      toast.error('Failed to cancel subscription');
    },
  });

  return query;
};

type UpdateResponseType = InferResponseType<
  (typeof honoClient.api.subscriptions)['update-subscription']['$patch'],
  201
>['data'];
type UpdateRequestType = InferRequestType<
  (typeof honoClient.api.subscriptions)['update-subscription']['$patch']
>['json'];

export const useUpdateActiveSubscription = () => {
  const queryClient = new QueryClient();
  const query = useMutation<UpdateResponseType, Error, UpdateRequestType>({
    mutationKey: ['update-subscription'],
    mutationFn: async (json) => {
      const res = await honoClient.api.subscriptions['update-subscription'].$patch({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to update active subscription');
      }

      const { data } = await res.json();
      return data;
    },
    onSuccess: (data) => {
      const subscriptionId = data.lemonSqueezyId;
      queryClient.invalidateQueries({ queryKey: ['active-subscription', { subscriptionId }] });
    },
  });

  return query;
};

type UpdatePaymentResponseType = InferResponseType<
  (typeof honoClient.api.subscriptions)['update-payment-method']['$post'],
  201
>;
type UpdatePaymentRequestType = InferRequestType<
  (typeof honoClient.api.subscriptions)['update-payment-method']['$post']
>['json'];

export const useUpdatePaymentMethod = () => {
  const query = useMutation<UpdatePaymentResponseType, Error, UpdatePaymentRequestType>({
    mutationKey: ['update-payment-method'],
    mutationFn: async (json) => {
      const res = await honoClient.api.subscriptions['update-payment-method'].$post({ json });
      if (!res || res.status !== 201) {
        throw new Error('Failed to update payment method');
      }

      const data = await res.json();
      return data;
    },
    onError: (error) => {
      toast.error('Failed to update payment method');
    },
  });

  return query;
};
