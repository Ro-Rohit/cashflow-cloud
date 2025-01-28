'use client';
import { Button } from '@/components/ui/button';
import { pricingPlans } from '@/lib/const';
import { cn } from '@/lib/utils';
import { Meteors } from './meteors';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const PricingCards = () => {
  const [mount, setMount] = useState(false);
  const auth = useUser();
  useEffect(() => {
    setMount(true);
  }, []);

  if (!mount) return null;

  const handleCheckout = async (plan: string) => {
    if (!auth.isSignedIn) {
      return redirect('/sign-in');
    }

    if (plan === 'Free Plan') {
      return redirect('/overview');
    }

    return redirect('/settings');
  };

  return (
    <div className="flex items-center bg-transparent justify-center flex-wrap gap-x-6 gap-y-10">
      {pricingPlans.map((plan) => (
        <div key={plan.name} className="">
          <div
            className={cn('w-full relative max-w-xs', {
              'border-primary': plan.name === 'Pro Plan',
            })}
          >
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] bg-red-500 rounded-full blur-3xl" />
            <div className="relative shadow-xl gap-y-2 bg-gray-900  border border-gray-800  px-4 py-8 h-full overflow-hidden rounded-2xl flex flex-col justify-end items-start">
              <Image src={'/diamond.svg'} alt="diamond" height={25} width={25} />

              <h6 className="font-medium text-slate-100 text-md">{plan.name}</h6>

              <h1 className="font-bold text-3xl text-white mb-4 relative z-50">{plan.price}</h1>
              <p className="font-normal text-base text-slate-400 mb-4 relative z-50">
                {plan.description}
              </p>

              <ul>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center mb-2 gap-x-2">
                    <Check className="size-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{feature}</p>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout(plan.name)}
                size="lg"
                className={cn('w-full mt-4 bg-gradient-to-b from-primary to-sky-700 text-gray-300')}
              >
                {plan.cta}
              </Button>
              <Meteors number={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PricingCards;
