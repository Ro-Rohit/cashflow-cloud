import { Button } from '@/components/ui/button';
import { useCreateConsent } from '@/features/setu/actions';
import { Link } from 'lucide-react';

const ConnectBank = () => {
  const consentMutation = useCreateConsent();

  const handleConnect = () => {
    consentMutation.mutate();
  };

  return (
    <section className="flex flex-col gap-y-4 md:flex-row justify-center md:justify-between items-center">
      <div className="gap-x-20 flex flex-col md:flex-row justify-center text-center md:text-left  items-center md:justify-between w-fit">
        <h6 className=" font-bold text-xl  text-black dark:text-white">Bank account</h6>
        <p className="text-slate-700 text-sm dark:text-white">No bank account connected</p>
      </div>
      <Button
        variant={'ghost'}
        disabled={consentMutation.isPending}
        className=" cursor-pointer"
        onClick={handleConnect}
        asChild
      >
        <div className="flex items-center gap-x-2">
          <Link className="size-4" />
          <span>Connect</span>
        </div>
      </Button>
    </section>
  );
};

export default ConnectBank;
