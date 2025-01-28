'use client';
import DataChart from '@/components/global/data-chart';
import Datagrid from '@/components/global/data-grid';

const Page = () => {
  return (
    <main className="max-w-screen-xl mb-10 mx-5 lg:mx-auto p-4 mt-[-140px]">
      <Datagrid />
      <DataChart />
    </main>
  );
};

export default Page;
