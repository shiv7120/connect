'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required.'),
  lastName: z.string().min(2, 'Last name is required.'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
}

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const profileDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'profiles', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileDocRef);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
    },
  });
  
  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
      });
    } else if (user) {
        form.reset({
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            phone: '',
            address: ''
        })
    }
  }, [user, userProfile, form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!profileDocRef || !user?.email) return;

    const dataToUpdate = { ...values, email: user.email };

    setDoc(profileDocRef, dataToUpdate, { merge: true })
      .then(() => {
        toast({
          title: 'Account Updated',
          description: 'Your profile has been successfully updated.',
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: profileDocRef.path,
          operation: 'update',
          requestResourceData: dataToUpdate,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }
  
  const isLoading = isUserLoading || isProfileLoading;
  const email = user?.email || '';

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Account Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Manage your account details here.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
              </div>
               <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-20 w-full" />
                </div>
              <Skeleton className="h-10 w-32" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                    <Input value={email} disabled />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
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
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
