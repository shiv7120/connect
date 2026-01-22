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
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

// Firestore session
interface Session {
    id: string;
    participantIds: string[];
    startTime: Timestamp;
    subject: string;
    status: 'completed' | 'scheduled' | 'cancelled' | 'Upcoming' | 'Completed' | 'Cancelled';
}

interface Mentor {
    name: string;
}

function SessionRow({ session }: { session: Session }) {
    const { user } = useUser();
    const firestore = useFirestore();

    const mentorId = session.participantIds.find(id => id !== user?.uid);

    const mentorDocRef = useMemoFirebase(() => {
        if (!firestore || !mentorId) return null;
        return doc(firestore, 'mentors', mentorId);
    }, [firestore, mentorId]);

    const { data: mentor, isLoading } = useDoc<Mentor>(mentorDocRef);

    const mentorName = isLoading ? <Skeleton className="h-4 w-24" /> : mentor?.name || '...';
    const sessionDate = session.startTime?.toDate().toLocaleString() || '...';
    
    // Normalize status values
    const getStatusVariant = (status: Session['status']) => {
        const lowerCaseStatus = status.toLowerCase();
        if (lowerCaseStatus === 'completed') return 'default';
        if (lowerCaseStatus === 'upcoming' || lowerCaseStatus === 'scheduled') return 'secondary';
        return 'destructive';
    }
    const normalizedStatus = session.status.charAt(0).toUpperCase() + session.status.slice(1).toLowerCase();

    return (
        <TableRow>
            <TableCell className="font-medium">{mentorName}</TableCell>
            <TableCell>{session.subject}</TableCell>
            <TableCell>{sessionDate}</TableCell>
            <TableCell className="text-right">
                <Badge variant={getStatusVariant(session.status)}>
                    {normalizedStatus}
                </Badge>
            </TableCell>
        </TableRow>
    )
}


export default function HistoryPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const sessionsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'sessions'),
            where('participantIds', 'array-contains', user.uid)
        );
    }, [user, firestore]);

    const { data: sessions, isLoading: isLoadingSessions } = useCollection<Session>(sessionsQuery);

    const isLoading = isUserLoading || isLoadingSessions;

    return (
        <div className="space-y-8">
             <h1 className="text-3xl font-headline font-bold">Session History</h1>
            <Card>
                <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>A record of all past and upcoming sessions.</CardDescription>
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
                        {isLoading ? (
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : sessions && sessions.length > 0 ? (
                            sessions.map((session) => (
                                <SessionRow key={session.id} session={session} />
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
    )
}

    