'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import UserProfile from './_components/profile';
import Billings from './_components/billings';
import ConnectBank from './_components/connect-bank';
import Invoice from './_components/invoice';

const Page = () => {
  return (
    <Card className="border border-primary max-w-screen-xl mx-5 lg:mx-auto shadow-md p-4 mt-[-140px]">
      <CardHeader className="flex flex-col sm:flex-row gap-y-1 items-center justify-between">
        <CardTitle className="text-2xl font-semibold">Settings page</CardTitle>
      </CardHeader>
      <CardContent>
        <Separator className="mb-10" />

        <ConnectBank />
        <Separator className="mb-20 mt-10" />

        <Billings />
        <Separator className="mb-20" />

        <Invoice />

        <UserProfile />
      </CardContent>
    </Card>
  );
};

export default Page;
