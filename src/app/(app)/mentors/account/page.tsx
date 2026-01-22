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

const mentorProfileSchema = z.object({
  firstName: z.string().min(2, 'First name is required.'),
  lastName: z.string().min(2, 'Last name is required.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  qualifications: z.string().min(5, 'Please enter your qualifications.'),
  subjects: z.string().min(3, 'Please list the subjects you can teach.'),
  hourlyRate: z.coerce.number().min(0, 'Hourly rate must be a positive number.'),
  availability: z.string().min(10, 'Please describe your availability.'),
});

type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
};

type MentorProfile = {
    id: string;
    name: string;
    qualifications: string;
    teachingSubjects: string[];
    hourlyRate: number;
    availability: string;
};

export default function MentorAccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const profileDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'profiles', user.uid);
  }, [user, firestore]);

  const mentorDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'mentors', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileDocRef);
  const { data: mentorProfile, isLoading: isMentorProfileLoading } = useDoc<MentorProfile>(mentorDocRef);

  const form = useForm<z.infer<typeof mentorProfileSchema>>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      qualifications: '',
      subjects: '',
      hourlyRate: 0,
      availability: '',
    },
  });
  
  useEffect(() => {
    if (userProfile && mentorProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        qualifications: mentorProfile.qualifications || '',
        subjects: mentorProfile.teachingSubjects?.join(', ') || '',
        hourlyRate: mentorProfile.hourlyRate || 0,
        availability: mentorProfile.availability || '',
      });
    } else if (user) {
        form.reset({
            ...form.getValues(),
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        });
    }
  }, [user, userProfile, mentorProfile, form]);

  async function onSubmit(values: z.infer<typeof mentorProfileSchema>) {
    if (!profileDocRef || !mentorDocRef || !user?.email) return;

    const { firstName, lastName, phone, address, qualifications, subjects, hourlyRate, availability } = values;

    const profileDataToUpdate = { firstName, lastName, phone, address, email: user.email };
    const mentorDataToUpdate = { 
        name: `${firstName} ${lastName}`,
        qualifications, 
        teachingSubjects: subjects.split(',').map(s => s.trim()), 
        hourlyRate, 
        availability 
    };

    const profileUpdatePromise = setDoc(profileDocRef, profileDataToUpdate, { merge: true })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: profileDocRef.path,
          operation: 'update',
          requestResourceData: profileDataToUpdate,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Throw to prevent toast
        throw permissionError;
      });

    const mentorUpdatePromise = setDoc(mentorDocRef, mentorDataToUpdate, { merge: true })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: mentorDocRef.path,
          operation: 'update',
          requestResourceData: mentorDataToUpdate,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Throw to prevent toast
        throw permissionError;
      });

    try {
        await Promise.all([profileUpdatePromise, mentorUpdatePromise]);
        toast({
            title: 'Account Updated',
            description: 'Your profile has been successfully updated.',
        });
    } catch (e) {
        // Errors are already emitted, just swallow them here to prevent unhandled promise rejection
    }
  }
  
  const isLoading = isUserLoading || isProfileLoading || isMentorProfileLoading;
  const email = user?.email || '';

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Account Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Mentor Profile</CardTitle>
          <CardDescription>Manage your account and public profile details here.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                  <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              </div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-20 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-20 w-full" /></div>
              <Skeleton className="h-10 w-32" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
                <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl><Input value={email} disabled /></FormControl>
                    <FormMessage />
                </FormItem>
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>

                <hr className="my-6" />
                <h3 className="text-lg font-medium">Public Mentor Details</h3>

                <FormField control={form.control} name="qualifications" render={({ field }) => (
                    <FormItem><FormLabel>Qualifications</FormLabel><FormControl><Input placeholder="e.g., M.Sc. in Physics" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="subjects" render={({ field }) => (
                    <FormItem><FormLabel>Teaching Subjects</FormLabel><FormControl><Input placeholder="Math, Physics, English..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                    <FormItem><FormLabel>Hourly Rate (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="availability" render={({ field }) => (
                    <FormItem><FormLabel>Availability</FormLabel><FormControl><Textarea placeholder="e.g., Weekdays 5pm-8pm, Weekends 10am-6pm" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>

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
