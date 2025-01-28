'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryTable } from './_components/data-table';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { CategoryType, columns } from './_components/columns';
import useConfirm from '@/hooks/use-confirm';
import { Skeleton } from '@/components/ui/skeleton';
import { useBulkDeleteCategories, useGetCategories } from '@/features/categories/actions';
import { useCreateCategoryStore } from '@/features/categories/hooks/create-category-store';
import { MAX_FREE_CATEGORY, MAX_PRO_CATEGORY } from '@/lib/const';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';
import { useGetDataCount } from '@/features/summary/actions';
import { toast } from 'sonner';

const Page = () => {
  const categoriesQuery = useGetCategories();
  const { setOpen: setCategoryOpenModal } = useCreateCategoryStore();
  const categoriesData: CategoryType[] = categoriesQuery.data ?? [];

  const { isLoading: isLoadingCount, data: countData } = useGetDataCount();
  const { plan, setOpen: setPlanModalOpen } = useSubscriptionStore();
  const deleteMutation = useBulkDeleteCategories();

  const [ConfirmDialog, confirm] = useConfirm({
    title: 'Delete Categories',
    message: 'Are you sure you want to delete all this categories?',
  });
  const handleDelete = async (ids: string[]) => {
    const ok = await confirm();
    if (!ok) return;
    deleteMutation.mutate({ ids });
  };

  const handleAddCategory = () => {
    if (!countData) return;
    const isFreePlanCompleted = countData.categoriesCount >= MAX_FREE_CATEGORY;
    const isProPlanCompleted = countData.categoriesCount >= MAX_PRO_CATEGORY;

    if (plan === 'free' && isFreePlanCompleted) {
      toast.info('Please upgrade  your plan to add more categories');
      setPlanModalOpen(true);
      return;
    }

    if (plan === 'pro' && isProPlanCompleted) {
      toast.info('Please upgrade  your plan to add more categories');
      setPlanModalOpen(true);
      return;
    }

    setCategoryOpenModal(true);
  };

  if (categoriesQuery.isLoading) {
    return (
      <Card className="border border-primary max-w-screen-xl mx-6 lg:mx-auto shadow-md p-4 mb-10 mt-[-140px]">
        <CardHeader>
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-8 w-96" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center w-full h-[500px]">
            <Loader2 className=" animate-spin size-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <Card className="border border-primary max-w-screen-xl mx-6 lg:mx-auto shadow-md p-4 mb-10 mt-[-140px]">
        <CardHeader className="flex flex-col gap-y-1 sm:flex-row items-center justify-between">
          <CardTitle className="text-2xl text-center sm:text-left font-semibold">
            Category page
          </CardTitle>
          <Button
            disabled={isLoadingCount || deleteMutation.isPending}
            onClick={handleAddCategory}
            className="w-full sm:w-auto"
          >
            <div className="flex items-center">
              <Plus />
              <span className="ml-2">Add new</span>
            </div>
          </Button>
        </CardHeader>
        <CardContent>
          <CategoryTable
            data={categoriesData}
            columns={columns}
            onDelete={handleDelete}
            filterKey="name"
            disabled={deleteMutation.isPending}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
