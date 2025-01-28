import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ClerkLoaded, ClerkLoading, UserButton } from '@clerk/nextjs';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TopNavigation: NextPage = () => {
  return (
    <header className="fixed top-0 w-full  backdrop-blur-sm border-b-2 shadow-sm z-[999999999] py-4">
      <div className="flex items-center w-full justify-between px-2.5 md:px-0 container mx-auto">
        <div className="flex items-center gap-x-2">
          <Image src={'/logo-white.svg'} height={25} width={25} alt="cashflow cloud logo" />
          <h3 className="text-xl text-primary-foreground font-extrabold">Cashflow Cloud</h3>
        </div>

        <ul className="hidden lg:flex items-center gap-x-3 text-md font-medium text-muted-foreground">
          <Link href={'/overview'} className="hover:text-white  transition">
            Home
          </Link>
          <Link href={'#'} className="hover:text-white  transition">
            Products
          </Link>
          <Link href={'#'} className="hover:text-white  transition">
            Pricing
          </Link>
          <Link href={'#'} className="hover:text-white  transition">
            Documentation
          </Link>
          <Link href={'#'} className="hover:text-white  transition">
            Support
          </Link>
        </ul>

        <div className="sm:flex hidden items-center gap-x-2">
          <Link href={'/overview'}>
            <Button
              className=" rounded-full !bg-white !hover:bg-white/70 transition !text-black"
              size={'lg'}
            >
              Dashboard
            </Button>
          </Link>

          <ClerkLoading>
            <Loader className="size-4 animate-spin text-muted-foreground" />
          </ClerkLoading>
          <ClerkLoaded>
            <UserButton />
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
