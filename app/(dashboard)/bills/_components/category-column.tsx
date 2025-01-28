import { Button } from '@/components/ui/button';
import { useEditCategoryStore } from '@/features/categories/hooks/edit-category-store';
import { useEditTransactionStore } from '@/features/transactions/hooks/edit-transaction-store';
import { TriangleAlertIcon } from 'lucide-react';
import { NextPage } from 'next';

interface Props {
  id: string | null;
  name: string | null;
  transactionId: string;
}

const CategoryColumn: NextPage<Props> = ({ name, id, transactionId }) => {
  const { setOpen } = useEditTransactionStore();
  const { setOpen: setCategoryOpen } = useEditCategoryStore();

  if (!name || !id) {
    return (
      <div
        onClick={() => setOpen(true, transactionId)}
        className="flex cursor-pointer items-center gap-2"
      >
        <TriangleAlertIcon className="size-4 text-rose-500" />
        <span className="text-sm text-rose-500">Uncategorised</span>
      </div>
    );
  }

  return (
    <Button
      variant={'link'}
      onClick={() => {
        setCategoryOpen(true, id);
      }}
    >
      {name}
    </Button>
  );
};

export default CategoryColumn;
