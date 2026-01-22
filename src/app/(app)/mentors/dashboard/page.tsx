'use client';

import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { ArrowRight, DollarSign, MessageSquare, Info } from 'lucide-react';
import { useUser } from '@/firebase';
import { useState, useEffect } from 'react';
import { testimonials } from '@/lib/data';

export default function MentorDashboard() {
  const { user } = useUser();
  const [isNewMentor, setIsNewMentor] = useState(false);
  const latestFeedback = testimonials[0];

  useEffect(() => {
    if (user && user.metadata.creationTime && user.metadata.lastSignInTime) {
      const creationTime = new Date(user.metadata.creationTime).getTime();
      const lastSignInTime = new Date(user.metadata.lastSignInTime).getTime();
      // Consider a new user if last sign-in is within 5 minutes of account creation.
      if (lastSignInTime - creationTime < 5 * 60 * 1000) {
        setIsNewMentor(true);
      }
    }
  }, [user]);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Welcome, {user?.displayName?.split(' ')[0] || 'Mentor'}!</h1>
        <p className="text-muted-foreground">Here's a summary of your mentorship activity.</p>
      </div>

      {isNewMentor && (
         <Card>
            <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-card">
                <Info className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold">Welcome to the Mentor Dashboard!</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Your application has been received. Once approved, you can start accepting sessions and earning.
                </p>
                </div>
            </CardContent>
         </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Monthly Earnings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isNewMentor ? (
                <>
                    <div className="text-2xl font-bold">₹0</div>
                    <p className="text-xs text-muted-foreground">No earnings yet.</p>
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">₹40,000</div>
                    <p className="text-xs text-muted-foreground">+20% from last month</p>
                </>
            )}
          </CardContent>
        </Card>

        {/* Latest Feedback */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latest Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isNewMentor || !latestFeedback ? (
                <p className="text-muted-foreground">No feedback yet.</p>
             ) : (
                <p className="text-sm text-muted-foreground italic">"{latestFeedback.quote}"</p>
             )}
          </CardContent>
        </Card>
        
        {/* Quick Links */}
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Jump to your most important pages.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                 <Link href="/mentors/earnings">
                     <div className="p-4 border rounded-lg hover:bg-accent transition-colors flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">Earnings</h3>
                            <p className="text-sm text-muted-foreground">Track your payments</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                </Link>
                 <Link href="/mentors/feedback">
                     <div className="p-4 border rounded-lg hover:bg-accent transition-colors flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">Feedback</h3>
                            <p className="text-sm text-muted-foreground">See parent reviews</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                </Link>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
