'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Filter, Info, UserPlus } from 'lucide-react';
import { z } from 'zod';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, Timestamp, query, where } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

import { mentors } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MentorCard } from '@/components/mentor-card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const RequestSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number with at least 10 digits.' }),
  subject: z.string().optional(),
  grade: z.string().optional(),
  location: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
});

const AuthPrompt = () => (
  <div className="flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-lg bg-card space-y-4">
    <UserPlus className="w-10 h-10 text-primary" />
    <h3 className="text-lg font-semibold">Sign In to Continue</h3>
    <p className="text-muted-foreground mt-2 text-sm max-w-xs">
      Please sign in or create an account to request a demo from a mentor.
    </p>
    <div className="flex gap-4 mt-4">
      <Button asChild>
        <Link href="/login">Sign In</Link>
      </Button>
      <Button asChild variant="secondary">
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  </div>
);


export default function FindAMentorPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [name, setName] = useState('');

  const sortedMentors = [...mentors].sort((a, b) => {
    if (a.isVerified !== b.isVerified) {
      return a.isVerified ? -1 : 1;
    }
    if (a.rating !== b.rating) {
      return b.rating - a.rating;
    }
    return b.reviewCount - a.reviewCount;
  });

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
    }
  }, [user]);

  const requestsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'mentorRequests'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: existingRequests, isLoading: isLoadingRequests } = useCollection(requestsQuery);

  const hasSubmittedRequest = !!user && !!existingRequests && existingRequests.length > 0;
  const showLoadingSkeleton = isUserLoading || (user && isLoadingRequests);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const validatedFields = RequestSchema.safeParse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      subject: formData.get('subject') || undefined,
      grade: formData.get('grade') || undefined,
      location: formData.get('location'),
    });

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to place request. Please check your input.',
      });
      setIsSubmitting(false);
      return;
    }

    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Database service is not available. Please try again later.',
        });
        setIsSubmitting(false);
        return;
    }
    
    const { name, phone, subject, grade, location } = validatedFields.data;
    const mentorRequestsCollection = collection(firestore, 'mentorRequests');

    addDocumentNonBlocking(mentorRequestsCollection, {
      name,
      phone,
      subject: subject || 'All Subjects',
      grade: grade || 'Any Grade',
      location: location,
      createdAt: Timestamp.now(),
      userId: user?.uid, // Attach user ID if logged in
    });

    toast({
      title: 'Success!',
      description: 'Your request has been placed successfully!',
    });
    // The component will re-render to show the success message, so no need to reset the form.
    setIsSubmitting(false);
  };
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Find the Perfect Mentor</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Place the request to find a mentor.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline">Request a Demo</CardTitle>
              <Filter className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {showLoadingSkeleton ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !user ? (
                <AuthPrompt />
              ) : hasSubmittedRequest ? (
                <div className="flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-lg bg-card">
                  <Info className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold">Request Submitted</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    You've already placed a request for a demo class. A mentor will contact you shortly.
                  </p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                      <Label htmlFor="name">Enter your name</Label>
                      <Input id="name" name="name" placeholder="e.g. Aditi Rao" required value={name} onChange={(e) => setName(e.target.value)} />
                       {errors?.name &&
                          errors.name.map((error: string) => (
                          <p className="text-sm font-medium text-destructive" key={error}>
                              {error}
                          </p>
                          ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="e.g. 9876543210" required />
                    {errors?.phone && errors.phone.map((error: string) => (
                      <p className="text-sm font-medium text-destructive" key={error}>
                        {error}
                      </p>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select name="subject">
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">Math</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="social studies">Social Studies</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="evs">EVS</SelectItem>
                        <SelectItem value="all">All Subjects</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade Level</Label>
                    <Select name="grade">
                      <SelectTrigger id="grade">
                        <SelectValue placeholder="Any Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st</SelectItem>
                        <SelectItem value="2nd">2nd</SelectItem>
                        <SelectItem value="3rd">3rd</SelectItem>
                        <SelectItem value="4th">4th</SelectItem>
                        <SelectItem value="5th">5th</SelectItem>
                        <SelectItem value="6th">6th</SelectItem>
                        <SelectItem value="7th">7th</SelectItem>
                        <SelectItem value="8th">8th</SelectItem>
                        <SelectItem value="9th">9th</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Address for Demo Class</Label>
                    <Input id="location" name="location" placeholder="e.g. Krishna Nagar Colour apartment 🏡" required />
                     {errors?.location &&
                      errors.location.map((error: string) => (
                      <p className="text-sm font-medium text-destructive" key={error}>
                          {error}
                      </p>
                      ))}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Place Request
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {sortedMentors.length} mentors
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
