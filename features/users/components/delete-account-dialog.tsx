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
import { Input } from '@/components/ui/input';
import { NextPage } from 'next';
import { useCreateVerificationToken, useDeleteUsers, useGetUser, useVerifyToken } from '../actions';
import { toast } from 'sonner';

interface Props {
  handleOpenChange: (open: boolean) => void;
  open: boolean;
  email?: string;
  username?: string;
}

export const DeleteAccountDialog: NextPage<Props> = ({
  handleOpenChange,
  open,
  email,
  username,
}) => {
  const verifyMutation = useVerifyToken();
  const deleteMutation = useDeleteUsers();
  const createVerficationToken = useCreateVerificationToken();
  const userQuery = useGetUser();

  const disabled =
    createVerficationToken.isPending || deleteMutation.isPending || verifyMutation.isPending;

  const handleVerifyAndDelete = () => {
    verifyMutation.mutate(
      { token: codeValue, tokenType: 'account_delete' },
      {
        onSuccess: () => {
          if (userQuery.data) {
            deleteMutation.mutate({ id: userQuery.data.id });
            toast.success('User account deleted permanently');
            handleOpenChange(false);
          } else {
            toast.error('Failed to delete  user account.Please try again later.');
          }
        },
      }
    );
  };

  const handleResend = () => {
    if (!email || !username) return;
    createVerficationToken.mutate(
      { email, username, tokenType: 'account_delete' },
      {
        onSuccess: () => {
          toast.success('An email has been sent to your email address');
        },
      }
    );
  };

  enum CONFIRMATION_TYPE {
    'DELETE_INPUT',
    'VERIFY_EMAIL',
  }

  const [codeValue, setCodeValue] = useState('');
  const [textValue, setTextValue] = useState('');

  const [changeDialog, setChangeDialog] = useState(CONFIRMATION_TYPE.DELETE_INPUT);

  return (
    <Dialog
      open={open}
      onOpenChange={(openClose) => {
        setTextValue('');
        setCodeValue('');
        setChangeDialog(CONFIRMATION_TYPE.DELETE_INPUT);
        handleOpenChange(openClose);
      }}
    >
      {changeDialog === CONFIRMATION_TYPE.VERIFY_EMAIL ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verification Code</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p>A verification code has been sent to your email address.</p>
                <p className="text-md text-rose-500 font-bold">This Action cannot be undone.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={codeValue}
            onChange={(e) => setCodeValue(e.target.value)}
            required
            type="text"
            autoFocus
          />
          <DialogFooter className="pt-2">
            <Button disabled={disabled} onClick={handleResend} variant={'outline'}>
              Resend email
            </Button>
            <Button variant={'destructive'} disabled={disabled} onClick={handleVerifyAndDelete}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription asChild>
              <p>
                Are you sure you want to delete <span className="text-white"> your account</span>{' '}
                permanently? This action will lose your all data and active subscription.
              </p>
            </DialogDescription>
          </DialogHeader>
          <p className="text-slate-700 dark:text-slate-500">
            Type <span className="text-rose-500 uppercase font-bold">DELETE</span> to confirm.
          </p>
          <Input
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            required
            type="text"
            autoFocus
          />
          <DialogFooter className="pt-2">
            <Button disabled={disabled} onClick={() => handleOpenChange(false)} variant={'outline'}>
              Cancel
            </Button>
            <Button
              disabled={disabled || textValue !== 'DELETE'}
              variant={'outline'}
              onClick={() => {
                setChangeDialog(CONFIRMATION_TYPE.VERIFY_EMAIL);
                handleResend();
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default DeleteAccountDialog;
