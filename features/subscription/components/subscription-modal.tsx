import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { pricingPlans } from '@/lib/const';
import { CheckCircle2, Wand } from 'lucide-react';
import { useSubscriptionStore } from '../hooks/use-subscription-store';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useCheckoutSubscription, useGetDiscounts } from '@/features/subscription/action';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const SubscriptionModal = () => {
  const { open, setOpen, plan: currentPlan } = useSubscriptionStore();
  const plan = pricingPlans.find((plan) => plan.code === currentPlan);
  const PRO_PLAN_ID = 634427;
  const UNLIMITED_PLAN_ID = 639871;

  const checkoutMutation = useCheckoutSubscription();
  const { data: discountsData } = useGetDiscounts();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Discount  code "${text}" applied successfully!`);
    });
  };

  const handlePlan = async (variantId: number) => {
    const code = await navigator.clipboard.readText();
    checkoutMutation.mutate({ variantId, code });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-4">
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex flex-col items-center gap-y-10">
              <Image
                src={'/logo-black.svg'}
                height={40}
                width={40}
                className="dark:invert"
                alt="Cashflow cloud Logo"
              />
              <h2 className="text-xl dark:text-white  font-bold text-black">{plan?.name}</h2>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            Upgrade to a paid plan to unlock more features.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-3" />

        <ul className=" flex flex-col items-center gap-y-2 mb-3">
          {plan?.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-x-2">
              <CheckCircle2 className="fill-primary dark:text-slate-400 text-slate-500 size-4" />
              <span className="dark:text-slate-500 text-slate-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="w-full mb-2">
          <h3 className="mb-2 text-md text-center dark:text-white font-semibold text-black">
            Special Offers Just for You 🌟
          </h3>
          <div className="flex flex-row flex-wrap justify-center  items-center gap-2">
            {discountsData?.map((discount, idx) => (
              <Badge
                className=" cursor-pointer"
                onClick={() => copyToClipboard(discount.code)}
                key={idx}
                variant={'default'}
              >
                <div className="flex items-center justify-center gap-x-1.5">
                  <Wand className="size-4" />
                  <code>{discount.code}</code>
                </div>
              </Badge>
            ))}
          </div>
        </div>

        <DialogFooter className="w-full flex  gap-x-2">
          {currentPlan !== 'pro' && (
            <Button
              variant={'premium'}
              onClick={() => {
                handlePlan(PRO_PLAN_ID);
              }}
              className="w-full"
              type="submit"
            >
              <div className="flex items-center gap-x-2">
                <span>Upgrade to Pro Plan</span>
                <Image src={'/diamond.svg'} alt="diamond" height={20} width={20} />
              </div>
            </Button>
          )}
          <Button
            variant={'premium'}
            onClick={() => handlePlan(UNLIMITED_PLAN_ID)}
            className="w-full"
            type="submit"
          >
            <div className="flex items-center gap-x-2">
              <span>Upgrade to Unlimited Plan</span>
              <Image src={'/diamond.svg'} alt="diamond" height={20} width={20} />
            </div>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
