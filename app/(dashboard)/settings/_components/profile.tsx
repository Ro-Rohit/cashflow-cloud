import { useGetUser } from '@/features/users/actions';
import UserForm from '@/features/users/components/user-form';
import { ChevronsUpDown, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

const UserProfile = () => {
  const userQuery = useGetUser();

  if (userQuery.isError) {
    return (
      <Collapsible>
        <div className="w-full border px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">User Profile</h2>
            <p className="text-slate-700 text-sm font-normal mt-3 dark:text-white">
              Manage your user Profile
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="w-full border px-8 py-4 flex items-center justify-center">
            <p className="text-red-500">Failed to load user profile. Please try again later.</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (userQuery.isLoading) {
    return (
      <Collapsible>
        <div className="w-full border px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">User Profile</h2>
            <p className="text-slate-700 text-sm font-normal mt-3 dark:text-white">
              Manage your user Profile
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Collapsible>
      <div className="w-full border px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-black dark:text-white">User Profile</h2>
          <p className="text-slate-700 text-sm font-normal mt-1 dark:text-white">
            Manage your user Profile
          </p>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="w-full border border-accent rounded py-10 max-w-2xl mx-auto mt-10 md:px-6 px-2">
          <UserForm email={userQuery.data?.email} defaultValue={userQuery.data} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default UserProfile;
