import { ClerkLoaded, ClerkLoading, SignIn } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function Page() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center overflow-y-auto">
      <h3 className="text-center text-3xl font-bold text-[#2e2a47] dark:text-slate-100 pt-16 mb-4 tracking-tight">
        Welcome Back!
      </h3>
      <p className="text-center text-base text-[#7e8ca0] mb-4  tracking-wide">
        Log in or Create to get back to your dashboard!
      </p>
      <ClerkLoading>
        <Loader2 className="size-8 animate-spin mx-auto w-full text-primary" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn />
      </ClerkLoaded>
    </div>
  );
}
