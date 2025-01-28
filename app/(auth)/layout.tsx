import { NextPage } from 'next';
import Image from 'next/image';

interface Props {
  children: React.ReactNode;
}

const AuthLayout: NextPage<Props> = ({ children }: Props) => {
  return (
    <main className="min-h-screen h-full w-full grid grid-cols-1  md:grid-cols-2">
      <div className="col-span-1 h-full flex items-center mb-10 justify-center">{children}</div>

      <div className="col-span-1 hidden md:flex justify-center gap-x-4 fixed right-0 h-full w-[50%] items-center dark:bg-gradient-to-b dark:from-blue-950 dark:to-sky-800 bg-gradient-to-b from-blue-700 to-sky-500">
        <Image
          src={'/logo-white.svg'}
          priority
          alt="Cashflow cloud Logo"
          height={100}
          width={100}
        />
        <h1 className="lg:text-5xl xl:text-6xl md:text-5xl text-4xl font-extrabold  text-white ">
          Cashflow Cloud
        </h1>
      </div>
    </main>
  );
};

export default AuthLayout;
