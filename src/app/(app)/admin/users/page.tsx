'use client';

import { collection, orderBy, query } from 'firebase/firestore';
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

export interface Account {
    id: string;
    email: string;
    userType: 'parent' | 'mentor';
}

export default function UsersPage() {
    const firestore = useFirestore();
    
    const accountsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const accountsCol = collection(firestore, 'account');
        return query(accountsCol, orderBy('email', 'asc'));
    }, [firestore]);

    const { data: accounts, isLoading } = useCollection<Account>(accountsQuery);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold">Registered Accounts</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Accounts</CardTitle>
                    <CardDescription>Here are all the registered accounts on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                </TableRow>
                                ))
                            ) : accounts?.map((account) => (
                                <TableRow key={account.id}>
                                    <TableCell>{account.email}</TableCell>
                                    <TableCell>{account.userType}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {!isLoading && (!accounts || accounts.length === 0) && (
                        <div className="text-center text-muted-foreground p-8">
                            No accounts found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
