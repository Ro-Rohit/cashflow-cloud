import Header from '@/components/global/header';
import { currentUser } from '@clerk/nextjs/server';
import { NextPage } from 'next';
import { redirect } from 'next/navigation';

interface Props {
  children: React.ReactNode;
}

const Layout: NextPage<Props> = async ({ children }: Props) => {
  const user = await currentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  if (!user.publicMetadata.isUserData) {
    return redirect('/user-profile');
  }

  return (
    <div className="min-h-screen h-full w-full pb-10">
      <Header />
      {children}
    </div>
  );
};

export default Layout;
