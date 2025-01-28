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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import BillTypeDropdown from '../components/bill-type-dropdown';
import BillStatusDropdown from '../components/bill-status-dropdown';

interface props {
  title: string;
  message: string;
}

type BillPropertyType = {
  type: string;
  status: string;
  remind: boolean;
};

export const useBillSelect = ({
  title,
  message,
}: props): [() => JSX.Element, () => Promise<BillPropertyType | undefined>] => {
  const billStatusRef = useRef<string>('');
  const billTypeRef = useRef<string>('');
  const remindRef = useRef<HTMLButtonElement | null>(null);

  const [promise, setPromise] = useState<{
    resolve: (value: BillPropertyType | undefined) => void;
  } | null>(null);

  const confirm = (): Promise<BillPropertyType | undefined> =>
    new Promise((resolve, reject) => {
      setPromise({ resolve });
    });

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    if (remindRef.current) {
      promise?.resolve({
        type: billTypeRef.current,
        status: billStatusRef.current,
        remind: remindRef.current.value === 'true',
      });
    }
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
        <div className="space-y-4 w-full flex flex-col">
          <BillTypeDropdown
            value={billTypeRef.current}
            onChange={(value) => {
              if (value) {
                billTypeRef.current = value;
              }
            }}
          />
          <BillStatusDropdown
            value={billStatusRef.current}
            onChange={(value) => {
              if (value) {
                billStatusRef.current = value;
              }
            }}
          />

          <div className="flex items-center justify-between w-full">
            <Label>Notify me before Due Date</Label>
            <Switch
              ref={remindRef}
              type="button"
              id="notification"
              onCheckedChange={(value) => {
                if (remindRef.current) {
                  remindRef.current.value = `${value}`;
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

export default useBillSelect;
