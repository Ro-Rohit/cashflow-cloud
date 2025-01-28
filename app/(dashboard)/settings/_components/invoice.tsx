import { useGetSubscriptionInvoice } from '@/features/subscription/action';
import { columns } from './columns';
import { InvoiceTable } from './data-table';
import { Loader2, ChevronsUpDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

const Invoice = () => {
  const {
    data: invoiceData,
    isLoading: invoiceLoading,
    error: invoiceError,
  } = useGetSubscriptionInvoice();

  if (invoiceError) {
    <Collapsible>
      <div className="w-full mb-10 border px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-black dark:text-white">Billing history</h2>
          <p className="text-slate-700 text-sm font-normal mt-3 dark:text-white">
            Manage your billing history
          </p>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mb-6">
        {invoiceError && (
          <p className="text-rose-500">Failed to load invoice data. Please try again later.</p>
        )}
      </CollapsibleContent>
    </Collapsible>;
  }

  return (
    <Collapsible>
      <div className="w-full border mb-10 px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-black dark:text-white">Billing history</h2>
          <p className="text-slate-700 text-sm font-normal mt-3 dark:text-white">
            Manage your billing history
          </p>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mb-6">
        {invoiceLoading ? (
          <div className="w-full flex items-center justify-center h-[300px]">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <InvoiceTable columns={columns} filterKey="plan" data={invoiceData || []} />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
export default Invoice;
