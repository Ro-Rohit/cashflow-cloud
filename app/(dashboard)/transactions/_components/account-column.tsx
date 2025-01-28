import { Button } from '@/components/ui/button';
import { useEditAccountStore } from '@/features/accounts/hooks/edit-account-store';
import { NextPage } from 'next';

interface Props {
  name: string;
  id: string;
}

const AccountColumn: NextPage<Props> = ({ name, id }) => {
  const { setOpen } = useEditAccountStore();

  return (
    <Button
      variant={'link'}
      onClick={() => {
        setOpen(true, id);
      }}
    >
      {name}
    </Button>
  );
};

export default AccountColumn;
