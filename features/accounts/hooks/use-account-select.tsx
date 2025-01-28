'use client';
import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SelectInput from '@/components/global/select-input';
import { useCreateAccount, useGetAccounts } from '../actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface props {
  title: string;
  message: string;
}

type OutputType = {
  accountId?: string | undefined;
  budget?: number | undefined;
};

export const useAccountSelect = ({
  title,
  message,
}: props): [() => JSX.Element, () => Promise<OutputType | undefined>] => {
  const accountQuery = useGetAccounts();
  const accountData = accountQuery.data;
  const createMutation = useCreateAccount();
  const handleCreate = (name: string) => {
    createMutation.mutate({ name });
  };

  const selectValue = useRef<string | undefined>();
  const budgetRef = useRef<HTMLInputElement | null>(null);

  const [promise, setPromise] = useState<{
    resolve: (value: OutputType | undefined) => void;
  } | null>(null);

  const confirm = (): Promise<OutputType | undefined> =>
    new Promise((resolve, reject) => {
      setPromise({ resolve });
    });

  const handleClose = () => {
    setPromise(null);
  };

  const options = (accountData ?? []).map((option) => ({
    label: option.name,
    value: option.id,
  }));

  const handleConfirm = () => {
    promise?.resolve({
      accountId: selectValue.current,
      budget: budgetRef.current ? parseInt(budgetRef.current.value) : undefined,
    });
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(undefined);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <Dialog open={promise !== null}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="my-4   w-full">
          <SelectInput
            isDisabled={accountQuery.isLoading || createMutation.isPending}
            value={selectValue.current}
            onChange={(value) => {
              selectValue.current = value;
            }}
            onCreate={handleCreate}
            options={options}
            placeholder="select an account"
          />
          <div className="w-full mt-4">
            <Label>Budget</Label>
            <Input
              ref={budgetRef}
              required
              className="h-10"
              type="number"
              placeholder="set a monthly budget for all category"
              min={99}
              onChange={(e) => {
                if (budgetRef.current) {
                  budgetRef.current.value = e.target.value;
                }
              }}
            />
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button onClick={handleCancel} variant={'outline'}>
            cancel
          </Button>
          <Button onClick={handleConfirm}>continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  return [ConfirmationDialog, confirm];
};

export default useAccountSelect;
