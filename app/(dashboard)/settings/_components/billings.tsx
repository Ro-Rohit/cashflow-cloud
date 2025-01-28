'use client';
import { useCheckoutSubscription, useGetDiscounts } from '@/features/subscription/action';
import { variantPlan } from '@/lib/const';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  useGetActiveSubscriptionById,
  useUpdateActiveSubscription,
} from '../../../../features/subscription/action/index';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Clipboard, Loader, Wand } from 'lucide-react';
import ActiveSubscription from './active-subscription';
import useConfirm from '@/hooks/use-confirm';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';

const Billings = () => {
  const { subscriptionId } = useSubscriptionStore();
  const { data: activeSubscriptionData, isLoading: subscriptionLoading } =
    useGetActiveSubscriptionById(subscriptionId);
  const { data: discountsData } = useGetDiscounts();

  const checkoutMutation = useCheckoutSubscription();
  const updateSubscriptionMutation = useUpdateActiveSubscription();
  const disabled = checkoutMutation.isPending || updateSubscriptionMutation.isPending;

  const [copyText, setCopyText] = useState<string | undefined>(undefined);

  const [ConfirmationDialog, handleConfirm] = useConfirm({
    title: 'Change Subscription',
    message: `Do you want to change your subscription plan? Your current plan is ${activeSubscriptionData?.variantName}`,
    buttonLabel: 'Continue',
    buttonVariant: 'warning',
  });

  const handlePlan = async (variantId: number, variantName: string, lemonSqueezyId?: string) => {
    if (activeSubscriptionData) {
      switch (activeSubscriptionData.status) {
        case 'cancelled':
          toast.info(`You cannot change your plan till ${activeSubscriptionData.endsAt}`);
          return;
        case 'unpaid':
          toast.info('Please clear your unpaid subscription first');
          return;
        case 'past_due':
          toast.info('Your Plan have some past due. Please clear it first');
          return;
        default:
          break;
      }

      if (lemonSqueezyId) {
        const ok = await handleConfirm();
        if (ok) {
          updateSubscriptionMutation.mutate(
            { lemonSqueezyId, variantId },
            {
              onSuccess: () => {
                toast.success(
                  `Your Current Plan "${activeSubscriptionData.variantName}" has been changed successfully. Your new plan from upcoming month is "${variantName}"`
                );
              },
              onError: () => {
                toast.error('failed to change plan. please try again later');
              },
            }
          );
        }
      }
    } else {
      checkoutMutation.mutate({ variantId, code: copyText });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyText(text);

      toast.success(`Discount code "${text}" applied successfully!`);
    });
  };
  const isPlanActive =
    activeSubscriptionData?.status === 'active' ||
    activeSubscriptionData?.status === 'on_trial' ||
    false;
  const [showPlan, setShowPlan] = useState(false);

  useEffect(() => {
    setShowPlan(activeSubscriptionData ? false : true);
  }, [activeSubscriptionData]);

  return (
    <>
      <ConfirmationDialog />
      <section className="w-full mb-20">
        <h3 className="text-xl font-semibold text-black dark:text-white">Plans and billing</h3>
        <p className="text-slate-700 text-sm font-normal mt-3 dark:text-white mb-4">
          Manage your plan
        </p>

        {subscriptionLoading ? (
          <Skeleton className="w-full mb-10 h-[100px]" />
        ) : (
          <ActiveSubscription
            data={activeSubscriptionData}
            disabled={disabled}
            handleShowPlan={setShowPlan}
            showPlan={showPlan}
          />
        )}

        {showPlan && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2  gap-4">
            {variantPlan.map((plan, index) => (
              <Card className="w-full shadow-md  border-accent rounded-lg" key={index}>
                <CardHeader>
                  <CardTitle className="font-semibold text-3xl mb-2 text-black dark:text-white">
                    {plan.variant.price}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-700 dark:text-white">
                    {plan.variant.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {plan.features?.map((feature, ftIdx) => (
                      <div key={ftIdx} className="w-full flex items-center gap-x-2">
                        <Check className="size-4 text-muted-foreground" />
                        <p key={ftIdx} className="text-muted-foreground text-sm font-normal">
                          {feature}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="my-4">
                    <h5 className="text-md text-black font-medium mb-2 dark:text-white">
                      Best Offer
                    </h5>
                    <div className="flex flex-row flex-wrap items-center gap-2">
                      {discountsData?.map((discount, idx) => (
                        <Badge
                          className=" cursor-pointer"
                          onClick={() => copyToClipboard(discount.code)}
                          key={idx}
                          variant={'default'}
                        >
                          <div className="flex items-center gap-x-1.5">
                            <Wand className="size-4" />
                            <code>{discount.code}</code>
                          </div>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={'premium'}
                    disabled={disabled}
                    size={'lg'}
                    className="w-full"
                    onClick={() =>
                      handlePlan(
                        plan.variant.id,
                        plan.variant.name,
                        activeSubscriptionData?.lemonSqueezyId
                      )
                    }
                  >
                    <div className="flex items-center gap-x-2">
                      {isPlanActive ? 'Change plan' : 'Add plan'}
                      {disabled && <Loader className="ml-2 size-4" />}
                      {!disabled && (
                        <Image src={'/diamond.svg'} alt="diamond" height={20} width={20} />
                      )}
                    </div>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {discountsData && (
          <div className="w-full my-10">
            <h3 className="text-2xl font-semibold text-black dark:text-white">
              Big Savings Await You! 🛍️
            </h3>
            <p className="text-slate-700 text-sm mb-8 font-normal mt-3 dark:text-white">
              Save now, thank yourself later!
            </p>
            <div className="grid w-full   grid-cols-1 md:grid-cols-2 gap-4">
              {discountsData.map((discount, idx) => {
                return (
                  <div key={idx} className="bg-primary/20 rounded-md px-8 py-4 shadow">
                    <h6 className="text-xl text-center md:text-left font-bold text-black dark:text-white">
                      {discount.name}
                    </h6>
                    <p className="text-sm text-center md:text-left text-slate-700 my-3 dark:text-white">
                      Get <code>{discount.amount}% on any purchase</code> discount
                    </p>
                    <div className="flex items-center px-2 justify-between rounded bg-background gap-x-2 border-2 border-spacing-2 py-1">
                      <code className="overflow-ellipsis ml-1">{discount.code}</code>
                      <Button variant={'outline'} onClick={() => copyToClipboard(discount.code)}>
                        <Clipboard className="size-4 shrink-0" />
                      </Button>
                    </div>
                    <p className="text-xs text-center md:text-left text-slate-700 mt-2 dark:text-white">
                      {discount.expiresAt && `Expires on: ${format(discount.expiresAt, 'PPP')}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Billings;
