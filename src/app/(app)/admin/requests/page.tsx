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

export interface MentorRequest {
    id: string;
    name: string;
    phone: string;
    subject: string;
    grade: string;
    location: string;
    createdAt: Timestamp;
}

export default function MentorRequestsPage() {
    const firestore = useFirestore();

    const requestsQuery = useMemoFirebase(() => {
        const requestsCol = collection(firestore, 'mentorRequests');
        return query(requestsCol, orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: requests, isLoading } = useCollection<MentorRequest>(requestsQuery);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold">Mentor Requests</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Submitted Requests</CardTitle>
                    <CardDescription>Here are all the mentor requests submitted by users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Requested On</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    </TableRow>
                                ))
                            ) : requests?.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">{request.name}</TableCell>
                                    <TableCell>{request.phone}</TableCell>
                                    <TableCell>{request.location}</TableCell>
                                    <TableCell>{request.subject}</TableCell>
                                    <TableCell>{request.grade}</TableCell>
                                    <TableCell>{request.createdAt.toDate().toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {!isLoading && (!requests || requests.length === 0) && (
                        <div className="text-center text-muted-foreground p-8">
                            No mentor requests found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
