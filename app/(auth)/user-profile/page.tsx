import UserForm from '@/features/users/components/user-form';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const Page = async () => {
  const user = await currentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  if (user.publicMetadata.isUserData) {
    return redirect('/overview');
  }

  return (
    <section className="flex flex-col px-6 pt-16 h-full overflow-y-auto w-full">
      <h1 className="text-2xl font-extrabold">Sign up</h1>
      <p className="text-sm text-muted-foreground mt-2 mb-6">Please Enter your details</p>
      <UserForm
        username={`${user.firstName} ${user.lastName}`}
        email={user.emailAddresses[0].emailAddress}
      />
    </section>
  );
};

export default Page;
