import { create } from 'zustand';

type PlanType = 'free' | 'pro' | 'unlimited';

type Store = {
  subscriptionId: string | undefined;
  setSubscriptionId: (subscriptionId: string | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  plan: PlanType;
  setPlan: (plan: PlanType) => void;
};

export const useSubscriptionStore = create<Store>()((set) => ({
  subscriptionId: undefined,
  setSubscriptionId: (subscriptionId: string | undefined) =>
    set((state) => ({ subscriptionId: subscriptionId })),
  open: false,
  setOpen: (open: boolean) => set((state) => ({ open: open })),
  plan: 'free',
  setPlan: (plan: PlanType) => set((state) => ({ plan: plan })),
}));
