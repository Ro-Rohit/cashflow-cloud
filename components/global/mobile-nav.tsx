'use client';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { navData } from '@/lib/const';
import { cn } from '@/lib/utils';
import { UserButton, useUser } from '@clerk/nextjs';

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const [mount, setMount] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    setMount(true);
  }, [mount]);
  if (!mount) {
    return null;
  }

  const handleClick = (href: string) => {
    setOpen(!open);
    router.push(href);
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          onClick={() => setOpen(!open)}
          className=" bg-white/10 text-white hover:text-white focus:ring-offset-0 focus-visible:ring-transparent outline-none border-0 hover:bg-white/20 transition cursor-pointer"
          variant={'outline'}
          size={'icon'}
        >
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side={'left'}>
        <SheetHeader>
          <SheetTitle asChild>
            <aside className="flex items-center text-white">
              <Image
                src={'/logo-black.svg'}
                priority
                className="dark:invert"
                height={30}
                width={30}
                alt="Cashflow cloud Logo"
              />
              <h4 className="text-xl text-black dark:text-white font-bold capitalize ml-2">
                Cashflow Cloud
              </h4>
            </aside>
          </SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>

        <nav className="flex  flex-col my-10  gap-y-3 w-full items-center">
          {navData.map((navItem) => (
            <Button
              key={navItem.href}
              onClick={() => handleClick(navItem.href)}
              variant="outline"
              size={'sm'}
              className={cn(
                'dark:text-white text-black text-sm lg:w-auto w-full border-none focus:ring-offset-0 outline-none focus-visible:ring-transparent font-normal dark:hover:text-white/90 hover:text-black/90 dark:hover:bg-white/20 dark:focus:bg-white/30 hover:bg-black/20 focus:bg-black/30   transition',
                pathname === navItem.href
                  ? 'dark:bg-white/10 bg-black/10 dark:text-white text-black'
                  : 'bg-transparent'
              )}
            >
              {navItem.label}
            </Button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="flex flex-row items-center h-20 justify-between w-full  border-t px-4 pt-2">
            <h6 className="w-full text-xl text-black dark:text-white gap-x-2 overflow-ellipsis">
              {user?.firstName} {user?.lastName}
            </h6>
            <div className="shrink-0 w-fit">
              <UserButton />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
