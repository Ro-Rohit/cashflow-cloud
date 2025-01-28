'use client';
import { NextPage } from 'next';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface Props {
  label: string;
  href: string;
  onClick?: () => void;
}

const NavigationButton: NextPage<Props> = ({ label, href, onClick }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const handleClick = () => {
    onClick?.();
    router.push(href);
  };
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size={'sm'}
      className={cn(
        'text-white text-sm lg:w-auto w-full border-none focus:ring-offset-0 outline-none focus-visible:ring-transparent font-normal hover:text-white/90  hover:bg-white/20 focus:bg-white/30   transition',
        pathname === href ? 'bg-white/10  text-white ' : 'bg-transparent'
      )}
    >
      {label}
    </Button>
  );
};

export default NavigationButton;
