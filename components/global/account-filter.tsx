'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { SelectValue } from '@radix-ui/react-select';
import { useGetAccounts } from '@/features/accounts/actions';
import { useGetSummary } from '@/features/summary/actions';

const AccountFilter = () => {
  const params = useSearchParams();
  const to = params.get('to') || '';
  const from = params.get('from') || '';
  const accountId = params.get('accountId') || 'all';
  const { data: accountsData, isLoading: isLoadingAccounts } = useGetAccounts();
  const { isLoading: isLoadingSummary } = useGetSummary();
  const router = useRouter();
  const pathname = usePathname();

  const pushToUrl = (value: string) => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          to,
          from,
          accountId: value === 'all' ? '' : value,
        },
      },
      { skipNull: true, skipEmptyString: true }
    );
    router.push(url);
  };

  return (
    <Select
      disabled={isLoadingAccounts || isLoadingSummary}
      value={accountId}
      onValueChange={pushToUrl}
    >
      <SelectTrigger className="lg:w-auto h-9 cursor-pointer rounded-md px-3 text-white hover:text-white bg-white/10 hover:bg-white/20 focus:bg-white/30 font-normal border-none focus:ring-offset-0 outline-none focus-visible:ring-transparent transition">
        <SelectValue placeholder="Select Account" defaultValue={accountId} />
      </SelectTrigger>
      <SelectContent className="px-1.5 max-h-[200px] overflow-y-auto">
        <SelectItem value="all">All Account</SelectItem>
        {accountsData?.map((account, idx) => (
          <SelectItem key={idx} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AccountFilter;
