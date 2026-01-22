'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { mentorEarnings } from "@/lib/data";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";

export default function MentorEarningsPage() {
    const { user } = useUser();
    const [isNewMentor, setIsNewMentor] = useState(false);

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
            <h1 className="text-3xl font-headline font-bold">Earnings</h1>
             <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Earnings</CardTitle>
                        <CardDescription>Your earnings for this month.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {isNewMentor ? (
                        <p className="text-5xl font-bold">₹0</p>
                    ) : (
                        <p className="text-5xl font-bold">₹40,000</p>
                    )}
                    </CardContent>
                    <CardFooter>
                    {isNewMentor ? (
                        <p className="text-xs text-muted-foreground">No earnings yet.</p>
                    ) : (
                        <p className="text-xs text-muted-foreground">+20% from last month</p>
                    )}
                    </CardFooter>
                </Card>
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Earnings History</CardTitle>
                        <CardDescription>Your earnings over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {isNewMentor ? (
                             <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                                <DollarSign className="w-12 h-12 mb-4" />
                                <h3 className="text-lg font-semibold">No Earnings History</h3>
                                <p>Once you start completing sessions, your earnings will appear here.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={mentorEarnings}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                        >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `₹${value}`} />
                                        <Legend />
                                        <Bar dataKey="amount" name="Earnings" fill="hsl(var(--chart-5))" />
                                    </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
