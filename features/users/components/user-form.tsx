'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NextPage } from 'next';
import { insertUsersSchema } from '@/db/schema';
import DatePicker from '@/components/global/date-picker';
import { useCreateUsers, useUpdateUser } from '../actions';
import { GetState, GetCity } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';
import { useEffect, useRef, useState } from 'react';
import { City, State } from 'react-country-state-city/dist/esm/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LandPlot, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import DeleteAccountDialog from './delete-account-dialog';

const formSchema = insertUsersSchema.omit({ id: true });
type FormValues = z.input<typeof formSchema>;

interface Props {
  username?: string;
  email?: string;
  defaultValue?: FormValues;
}

const UserForm: NextPage<Props> = ({ email, username, defaultValue }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValue
      ? defaultValue
      : { username, email, address: '', postalCode: '', phone: '' },
  });
  const createMutation = useCreateUsers();
  const updateMutation = useUpdateUser();
  const [stateList, setStateList] = useState<State[]>([]);
  const [cityList, setCityList] = useState<City[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const COUNTRY_ID = 101;
  const disabled = updateMutation.isPending || createMutation.isPending;

  useEffect(() => {
    GetState(COUNTRY_ID).then((result: State[]) => {
      setStateList(result);
    });
  }, []);

  const handleSubmit = (values: FormValues) => {
    if (defaultValue) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const cityCache = useRef<Record<number, City[]>>({});
  const handleStateChange = (stateId: number) => {
    if (cityCache.current[stateId]) {
      setCityList(cityCache.current[stateId]);
    } else {
      GetCity(COUNTRY_ID, stateId).then((cities) => {
        cityCache.current[stateId] = cities;
        setCityList(cities);
      });
    }
  };

  return (
    <>
      <DeleteAccountDialog
        open={dialogOpen}
        handleOpenChange={setDialogOpen}
        email={defaultValue?.email}
        username={defaultValue?.username}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-y-10">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    autoFocus
                    required
                    className="h-10"
                    disabled={disabled}
                    type="text"
                    placeholder="Your name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    required
                    className="h-10"
                    disabled={disabled || !!email}
                    type="text"
                    placeholder="myemail@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <DatePicker
                    placeholder="Choose date of Birth"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        disabled={disabled}
                        variant={'outline'}
                        className={cn(
                          'w-full  justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <MapPin className=" size-4  mr-2" />
                        {field.value ? field.value : <span>Select State</span>}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="overflow-y-auto h-[350px]">
                      {stateList.map((state) => (
                        <DropdownMenuItem
                          key={state.id}
                          onClick={() => {
                            field.onChange(state.name);
                            handleStateChange(state.id);
                          }}
                        >
                          {state.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        disabled={disabled || cityList.length === 0}
                        variant={'outline'}
                        className={cn(
                          'w-full  justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <LandPlot className=" size-4  mr-2" />
                        {field.value ? field.value : <span>Select City</span>}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="overflow-y-auto h-[350px]">
                      {cityList.map((city, idx) => (
                        <DropdownMenuItem key={idx} onClick={() => field.onChange(city.name)}>
                          {city.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    required
                    className="h-10"
                    disabled={disabled}
                    type="text"
                    placeholder="Street Address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <PhoneInput
                    {...field}
                    country={'IN'}
                    defaultCountry="IN"
                    style={{ fontSize: 'inherit', innerHeight: '60px', outerHeight: '60px' }}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    placeholder="Enter phone number"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal code</FormLabel>
                <FormControl>
                  <Input
                    required
                    className="h-10"
                    disabled={disabled}
                    type="text"
                    placeholder="493221"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button size={'lg'} className="w-full mt-4" disabled={disabled} type="submit">
            {defaultValue ? 'Update account' : 'Create account'}
          </Button>
          {defaultValue && (
            <Button
              className="w-full -translate-y-6"
              onClick={() => setDialogOpen(true)}
              size={'lg'}
              variant={'destructive'}
              disabled={disabled}
              type="button"
            >
              Delete Account
            </Button>
          )}
        </form>
      </Form>
    </>
  );
};

export default UserForm;
