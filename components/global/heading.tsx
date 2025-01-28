'use client';
import { usePathname } from 'next/navigation';
import { navData } from '@/lib/const';
import { useUser } from '@clerk/nextjs';

const Heading = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const data = navData.find((item) => item.href === pathname);
  const userName = user ? user.firstName + '👋🏻' : '';

  return (
    <>
      <h1 className="lg:text-3xl text-center md:text-left text-xl font-bold capitalize pb-1 text-white">
        {data?.title}
        {data?.label === 'Overview' ? userName : ''}
      </h1>
      <p className="text-sm text-center md:text-left text-white/80">{data?.description}</p>
    </>
  );
};

export default Heading;
