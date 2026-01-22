'use client';

import { collection, orderBy, query, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
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
import { Skeleton } from "@/components/ui/skeleton";

export interface MentorApplication {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    subjects: string;
    qualifications: string;
    bio: string;
    createdAt: Timestamp;
    aadharCard: string;
    class12Marksheet: string;
}

export default function MentorApplicationsPage() {
    const firestore = useFirestore();
    
    const applicationsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const applicationsCol = collection(firestore, 'mentorApplications');
        return query(applicationsCol, orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: applications, isLoading } = useCollection<MentorApplication>(applicationsQuery);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold">Mentor Applications</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Submitted Applications</CardTitle>
                    <CardDescription>Here are all the mentor applications submitted by users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Subjects</TableHead>
                                <TableHead>Aadhar Card</TableHead>
                                <TableHead>Class 12 Marksheet</TableHead>
                                <TableHead>Submitted On</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                </TableRow>
                                ))
                            ) : applications?.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">{app.firstName} {app.lastName}</TableCell>
                                    <TableCell>{app.email}</TableCell>
                                    <TableCell>{app.phone}</TableCell>
                                    <TableCell>{app.subjects}</TableCell>
                                    <TableCell>{app.aadharCard}</TableCell>
                                    <TableCell>{app.class12Marksheet}</TableCell>
                                    <TableCell>{new Date(app.createdAt.seconds * 1000).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {!isLoading && (!applications || applications.length === 0) && (
                        <div className="text-center text-muted-foreground p-8">
                            No mentor applications found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
