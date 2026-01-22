'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge";
import { progressReports, studentSessions } from "@/lib/data";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { Info } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useUser();
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (user && user.metadata.creationTime && user.metadata.lastSignInTime) {
      const creationTime = new Date(user.metadata.creationTime).getTime();
      const lastSignInTime = new Date(user.metadata.lastSignInTime).getTime();
      // Consider a new user if last sign-in is within 5 minutes of account creation.
      if (lastSignInTime - creationTime < 5 * 60 * 1000) {
        setIsNewUser(true);
      }
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Track your success with Connect Mentor.</p>
      </div>

      {isNewUser && (
         <Card>
            <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-card">
                <Info className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold">Welcome to Connect Mentor!</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Your request for a demo class has been placed. A mentor will contact you shortly to schedule your first session.
                </p>
                </div>
            </CardContent>
         </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="md:col-span-2">
            <CardHeader>
            <CardTitle>Your Progress Over Time</CardTitle>
            <CardDescription>Monthly average scores across subjects.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={progressReports}
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
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Math" fill="hsl(var(--chart-1))" />
                        <Bar dataKey="Science" fill="hsl(var(--chart-2))" />
                        <Bar dataKey="English" fill="hsl(var(--chart-3))" />
                    </BarChart>
            </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card className="md:col-span-2">
            <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>A quick look at your recent sessions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {studentSessions.slice(0, 3).length > 0 ? (
                    studentSessions.slice(0, 3).map((session) => (
                        <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.mentorName}</TableCell>
                        <TableCell>{session.subject}</TableCell>
                        <TableCell>{session.date}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant={session.status === 'Completed' ? 'default' : session.status === 'Upcoming' ? 'secondary' : 'destructive'}>
                            {session.status}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No session history yet.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
