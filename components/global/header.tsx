'use client';
import { NextPage } from 'next';
import Image from 'next/image';
import { ModeToggle } from './mode-toggle';
import NavigationButton from './navigation-btn';
import MobileNav from './mobile-nav';
import { navData } from '@/lib/const';
import Heading from './heading';
import { ClerkLoaded, ClerkLoading, UserButton, useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import AccountFilter from './account-filter';
import DateFilter from './date-filter';
import SummaryDownload from './summary-download';
import { useEffect } from 'react';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';

const Header: NextPage = () => {
  const { user } = useUser();
  const { setPlan, setSubscriptionId } = useSubscriptionStore();
  useEffect(() => {
    if (user && user.publicMetadata.plan) {
      setPlan(user.publicMetadata.plan as 'unlimited' | 'pro');
    }
    if (user && user.publicMetadata.subscriptionId) {
      setSubscriptionId(user.publicMetadata.subscriptionId as string);
    }
  }, [user, setPlan]);

  return (
    <header className="w-full min-h-[380px] h-full  bg-gradient pt-16 pb-4 md:px-8 px-4  bg-gradient-to-b from-blue-700 to-sky-500 dark:bg-gradient-to-b dark:from-blue-950 dark:to-sky-800 ">
      <div className="container w-full h-full mx-auto overflow-hidden">
        <div className="flex items-center mb-12">
          {/* logo */}
          <aside className="hidden lg:flex items-center">
            <Image
              src={'/logo-white.svg'}
              priority
              height={50}
              width={50}
              alt="Cashflow cloud Logo"
            />
            <h4 className="text-xl text-white font-bold capitalize ml-2">Cashflow Cloud</h4>
            {/* desktop  */}
            <nav className="hidden lg:flex items-center ml-16 gap-x-2">
              {navData.map((navItem) => (
                <NavigationButton key={navItem.href} label={navItem.label} href={navItem.href} />
              ))}
            </nav>
          </aside>

          <aside className="lg:hidden">
            <MobileNav />
          </aside>

          <aside className="ml-auto flex items-center gap-2">
            <ModeToggle />
            <ClerkLoading>
              <Loader2 className="text-muted-foreground animate-spin size-4" />
            </ClerkLoading>
            <ClerkLoaded>
              <UserButton />
            </ClerkLoaded>
          </aside>
        </div>

        <Heading />
        <div className=" flex mt-5 flex-col md:flex-row justify-between  gap-y-2 lg:gap-y-0  items-center">
          <div className="flex flex-col md:flex-row items-center md:gap-x-2 gap-y-2 lg:gap-y-0 ">
            <AccountFilter />
            <DateFilter />
          </div>
          <SummaryDownload />
        </div>
      </div>
    </header>
  );
};

export default Header;
