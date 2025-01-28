'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface props {
  title: string;
  message: string;
  buttonLabel?: string;
  buttonVariant?: 'destructive' | 'outline' | 'ghost' | 'warning' | 'default' | 'secondary';
}

export const useConfirm = ({
  title,
  message,
  buttonLabel = 'Delete',
  buttonVariant = 'destructive',
}: props): [() => JSX.Element, () => Promise<unknown>] => {
  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = () =>
    new Promise((resolve, reject) => {
      setPromise({ resolve });
    });

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <Dialog open={promise !== null} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex gap-2 items-center justify-end">
            <Button onClick={handleCancel} variant={'outline'}>
              cancel
            </Button>
            <Button onClick={handleConfirm} variant={buttonVariant}>
              {buttonLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  return [ConfirmationDialog, confirm];
};

export default useConfirm;
