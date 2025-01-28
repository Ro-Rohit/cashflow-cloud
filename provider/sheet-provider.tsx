'use client';

import EditAccountSheet from '@/features/accounts/components/edit-account-sheet';
import NewAccountSheet from '@/features/accounts/components/new-account-sheet copy';
import EditCategorySheet from '@/features/categories/components/edit-category-sheet';
import NewCategorySheet from '@/features/categories/components/new-category-sheet';
import SubscriptionModal from '@/features/subscription/components/subscription-modal';
import EditTransactionSheet from '@/features/transactions/components/edit-transaction-sheet';
import NewTransactionSheet from '@/features/transactions/components/new-transaction-sheet';
import NewBillSheet from '../features/bills/components/new-bill-sheet';
import EditBillSheet from '../features/bills/components/edit-bill-sheet';
import { useEffect, useState } from 'react';

const SheetProvider = () => {
  const [mount, setMount] = useState(false);
  useEffect(() => {
    setMount(true);
  });
  if (!mount) return null;
  return (
    <div>
      <NewBillSheet />
      <EditBillSheet/>
      <NewAccountSheet />
      <EditAccountSheet />
      <NewCategorySheet />
      <EditCategorySheet />
      <NewTransactionSheet />
      <EditTransactionSheet />
      <SubscriptionModal />
    </div>
  );
};

export default SheetProvider;
