'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Info, UserPlus } from 'lucide-react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, Timestamp, query, where } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name is required.'),
  lastName: z.string().min(2, 'Last name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  address: z
    .string()
    .min(10, 'Please enter a full address.')
    .max(200, 'Address is too long.'),
  qualifications: z.string().min(5, 'Please enter your qualifications.'),
  subjects: z.string().min(3, 'Please list the subjects you can teach.'),
  bio: z
    .string()
    .min(20, 'Bio must be at least 20 characters long.')
    .max(500, 'Bio must be less than 500 characters.'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions.',
  }),
});

type ApplicationInput = Omit<z.infer<typeof formSchema>, 'terms'>;

const AuthPrompt = () => (
  <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-card space-y-4">
    <UserPlus className="w-12 h-12 text-primary" />
    <h3 className="text-xl font-semibold">Create an Account to Apply</h3>
    <p className="text-muted-foreground mt-2 max-w-sm">
      To become a mentor, you need to have an account with us. Please sign up or log in to continue with your application.
    </p>
    <div className="flex gap-4 mt-6">
      <Button asChild>
        <Link href="/login">Sign In</Link>
      </Button>
      <Button asChild variant="secondary">
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  </div>
);


export default function JoinAsMentorPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const applicationsQuery = useMemoFirebase(() => {
    // We can only check for existing applications if the user is logged in and we have their email.
    if (!user?.email || !firestore) return null;
    return query(collection(firestore, 'mentorApplications'), where('email', '==', user.email));
  }, [user, firestore]);

  const { data: existingApplications, isLoading: isLoadingApplications } = useCollection(applicationsQuery);

  const hasSubmittedApplication = !!existingApplications && existingApplications.length > 0;
  const showLoadingSkeleton = isUserLoading || (user && isLoadingApplications);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      qualifications: '',
      subjects: '',
      bio: '',
      terms: false,
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue('firstName', user.displayName?.split(' ')[0] || '');
      form.setValue('lastName', user.displayName?.split(' ').slice(1).join(' ') || '');
      form.setValue('email', user.email || '');
    }
  }, [user, form.setValue]);


  async function saveMentorApplication(application: ApplicationInput) {
    if (!firestore) {
      throw new Error("Firestore is not initialized.");
    }
    const mentorApplicationsCollection = collection(
      firestore,
      'mentorApplications'
    );
    addDocumentNonBlocking(mentorApplicationsCollection, {
      ...application,
      userId: user?.uid, // Attach userId if user is logged in
      createdAt: Timestamp.now(),
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { terms, ...applicationData } = values;
      await saveMentorApplication(applicationData);

      toast({
        title: 'Application Submitted!',
        description:
          'Application submitted successfully! We will review it and get back to you.',
      });
      // The component will re-render to show the success message, so no need to reset the form.
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description:
          error instanceof Error
            ? error.message
            : 'A database error occurred. Failed to submit application.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-headline">
            Become a Mentor
          </CardTitle>
          <CardDescription>
            Join our community of passionate educators and make a real impact.
            Fill out the form below to start your journey with Connect Mentor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showLoadingSkeleton ? (
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          ) : !user ? (
            <AuthPrompt />
          ): hasSubmittedApplication ? (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-card">
              <Info className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold">Application Submitted</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                You have already submitted an application. We will review it and get back to you shortly.
              </p>
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
                          <Input placeholder="Anjali" {...field} />
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
                          <Input placeholder="Sharma" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+91 12345 67890"
                          {...field}
                        />
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
                        <Textarea
                          placeholder="Please enter your full address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Highest Qualification</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. M.Sc. in Physics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subjects You Can Teach</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Math, Physics, English..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Separate subjects with a comma.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your teaching philosophy and experience..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the{' '}
                          <Link href="/terms" className="underline">
                            terms and conditions
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
