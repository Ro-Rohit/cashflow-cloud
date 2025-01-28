import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SubscriptionStatusType, insertSubscriptionsSchema } from '@/db/schema';
import {
  useCancelActiveSubscription,
  useUpdateActiveSubscription,
  useUpdatePaymentMethod,
} from '@/features/subscription/action';
import useConfirm from '@/hooks/use-confirm';
import { MoreVertical } from 'lucide-react';
import { NextPage } from 'next';
import { toast } from 'sonner';
import z from 'zod';

interface Props {
  data?: z.input<typeof insertSubscriptionsSchema> | null;
  handleShowPlan: (value: boolean) => void;
  showPlan: boolean;
  disabled?: boolean;
}

const ActiveSubscription: NextPage<Props> = ({ data, handleShowPlan, disabled, showPlan }) => {
  const updatePaymentMutation = useUpdatePaymentMethod();
  const updateSubscriptionMutation = useUpdateActiveSubscription();
  const cancelSubscriptionMutation = useCancelActiveSubscription();

  if (!data)
    return (
      <section className="w-full mb-10 bg-secondary  border p-6 shadow-md rounded-md">
        <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">Free Plan</h2>
        <p className="not-prose mb-2 text-black dark:text-white">
          It appears that you do not have any subscriptions. Please choose a plan below.
        </p>
      </section>
    );

  const isDisabled =
    updatePaymentMutation.isPending ||
    updateSubscriptionMutation.isPending ||
    cancelSubscriptionMutation.isPending ||
    disabled;

  const getBadgeVariant = (status: SubscriptionStatusType) => {
    switch (status) {
      case 'active':
        return 'successAccent';
      case 'cancelled':
        return 'warningAccent';
      case 'paused':
        return 'warningAccent';
      case 'expired':
        return 'destructiveAccent';
      case 'unpaid':
        return 'destructiveAccent';
      default:
        return 'outline';
    }
  };

  const isPlanPaused = data.isPaused && !!data.pausedAt;
  const planPausedOrResume = isPlanPaused ? 'Resume' : 'Pause';
  const isPlanActive = data.status === 'active' || data.status === 'on_trial';
  const isPlanTechnicallyActive =
    (data.status === 'cancelled' && data.endsAt <= new Date()) || isPlanActive;

  const [CancelDialog, handleConfirmCancel] = useConfirm({
    title: 'Cancel Subscription',
    message: `Do you want to cancel your subscription plan? Your current plan is ${data?.variantName}`,
    buttonLabel: 'Continue',
  });

  const [UpdateDialog, handleConfirmUpdate] = useConfirm({
    title: `${planPausedOrResume} subscription`,
    message: `Do you want to ${planPausedOrResume} your subscription plan? Your current plan is ${data?.variantName}`,
    buttonLabel: planPausedOrResume,
    buttonVariant: 'warning',
  });

  const handleCancel = async () => {
    if (data.status === 'cancelled') {
      toast.info('Your plan is already cancelled.');
      return;
    }

    if (data.status === 'expired') {
      toast.info('Your plan is already expired');
      return;
    }
    if (data.status === 'unpaid') {
      toast.info('Your plan is already unpaid.');
      return;
    }
    const ok = await handleConfirmCancel();
    if (!ok) return;
    cancelSubscriptionMutation.mutate({ lemonSqueezyId: data.lemonSqueezyId });
  };

  const handleUpdate = async () => {
    if (data.status === 'cancelled') {
      toast.info('Your plan is already cancelled.');
      return;
    }

    if (data.status === 'expired') {
      toast.info('Your plan is expired.');
      return;
    }
    if (data.status === 'unpaid') {
      toast.info('Your plan is unpaid.');
      return;
    }
    if (data.status === 'past_due') {
      toast.info('Please clear your past due first.');
      return;
    }

    const ok = await handleConfirmUpdate();
    if (!ok) return;

    updateSubscriptionMutation.mutate(
      {
        lemonSqueezyId: data.lemonSqueezyId,
        paused: data.status === 'paused' ? false : true,
      },
      {
        onSuccess: () => {
          const updatedPlanStatus = data.status === 'paused' ? 'active' : 'paused';
          toast.success(`Your plan has been ${updatedPlanStatus} successfully`);
        },
        onError: () => {
          toast.error(`failed to ${planPausedOrResume} plan. please try again later`);
        },
      }
    );
  };

  const handlePayment = (isPortal: boolean) => {
    updatePaymentMutation.mutate(
      { lemonSqueezyId: data.lemonSqueezyId },
      {
        onSuccess: (data) => {
          window.location.href = isPortal
            ? data.url.customer_portal
            : data.url.update_payment_method;
        },
      }
    );
  };

  return (
    <>
      <CancelDialog />
      <UpdateDialog />
      <section className="w-full border p-4 mb-10 rounded-md">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-black dark:text-white">{data.variantName}</h2>
          <div className="flex items-center gap-x-2">
            <Button
              variant={'outline'}
              size={'sm'}
              onClick={() => handleShowPlan(!showPlan)}
              disabled={isDisabled}
            >
              {showPlan ? 'hide Plan' : 'show Plan'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled={isDisabled} onClick={handleUpdate}>
                  <Button variant="ghost">{planPausedOrResume} payment</Button>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={isDisabled} onClick={() => handlePayment(true)}>
                  <Button variant="ghost">customer portal</Button>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={isDisabled} onClick={() => handlePayment(false)}>
                  <Button variant="ghost">Update payment Method</Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={isDisabled} onClick={handleCancel}>
                  <Button variant="ghost" className="text-red-500">
                    cancel subscription
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex mt-4 mb-2 items-center gap-x-4">
          <Badge>{data.price}</Badge>
          <Badge variant={getBadgeVariant(data.status)}>{data.status}</Badge>
          {isPlanPaused && <Badge variant={'warningAccent'}>Paused</Badge>}
        </div>
        <div className="flex text-sm mt-4 mb-2  items-center gap-x-6">
          <p>created on {data.createdAt?.toDateString()}</p>
          <p>Renews on {data.renewsAt.toDateString()}</p>
        </div>
        {!isPlanTechnicallyActive && (
          <p className="text-rose-500 text-sm">
            Your plan is {data.status}.Choose a new plan to activate it.
          </p>
        )}
      </section>
    </>
  );
};

export default ActiveSubscription;
