'use client';
import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter } from '@/firebase';
import { collection, query, where, Timestamp, addDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from '@/components/ui/skeleton';

// Assuming Session has these fields from your schema
interface Session {
    id: string;
    participantIds: string[];
    startTime: Timestamp;
    subject?: string; 
    status: 'completed' | 'scheduled' | 'cancelled';
}

interface Feedback {
    id: string;
    sessionId: string;
    creatorId: string;
    recipientId: string;
    rating: number;
    comment: string;
    createdAt: Timestamp;
}


export default function FeedbackPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [selectedSessionId, setSelectedSessionId] = useState<string>('');
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Fetch completed sessions for the current student
    const sessionsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'sessions'),
            where('participantIds', 'array-contains', user.uid),
            where('status', '==', 'completed')
        );
    }, [user, firestore]);

    const { data: sessions, isLoading: isLoadingSessions } = useCollection<Session>(sessionsQuery);
    
    const submittedFeedbackQuery = useMemoFirebase(() => {
        if(!user || !firestore) return null;
        return query(collection(firestore, 'feedbacks'), where('creatorId', '==', user.uid));
    }, [user, firestore]);
    const { data: submittedFeedbacks, isLoading: isLoadingFeedbacks } = useCollection<{sessionId: string}>(submittedFeedbackQuery);
    const submittedSessionIds = useMemo(() => {
        return submittedFeedbacks?.map(f => f.sessionId) || [];
    }, [submittedFeedbacks]);

    const availableSessions = useMemo(() => {
        return sessions?.filter(s => !submittedSessionIds.includes(s.id)) || [];
    }, [sessions, submittedSessionIds]);


    const handleSubmit = async () => {
        if (!user || !firestore || !selectedSessionId || rating === 0) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select a session and provide a rating.'
            });
            return;
        }
        setIsSubmitting(true);

        const selectedSession = sessions?.find(s => s.id === selectedSessionId);
        if (!selectedSession) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Selected session not found.'
            });
            setIsSubmitting(false);
            return;
        }

        const recipientId = selectedSession.participantIds.find(id => id !== user.uid);
        if (!recipientId) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not identify the mentor for this session.'
            });
            setIsSubmitting(false);
            return;
        }

        const feedbackData = {
            sessionId: selectedSessionId,
            creatorId: user.uid,
            recipientId: recipientId,
            rating: rating,
            comment: comment,
            createdAt: Timestamp.now(),
        };

        const feedbacksCollection = collection(firestore, 'feedbacks');
        
        addDoc(feedbacksCollection, feedbackData).then(() => {
             toast({
                title: 'Feedback Submitted!',
                description: 'Thank you for your feedback.',
            });
            // Reset form
            setSelectedSessionId('');
            setRating(0);
            setComment('');
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: feedbacksCollection.path,
                operation: 'create',
                requestResourceData: feedbackData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => {
            setIsSubmitting(false);
        });
    }

    const isLoading = isUserLoading || isLoadingSessions || isLoadingFeedbacks;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold">Submit Feedback</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Share Your Experience</CardTitle>
                    <CardDescription>Your feedback helps us and our mentors improve.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoading ? (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <div className="flex gap-1">
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                            <Skeleton className="h-10 w-32" />
                        </div>
                    ) : availableSessions.length > 0 ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="session-select">Select a recent session</Label>
                                <Select onValueChange={setSelectedSessionId} value={selectedSessionId}>
                                    <SelectTrigger id="session-select">
                                        <SelectValue placeholder="Choose a completed session..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSessions.map(s => {
                                            const sessionDate = s.startTime?.toDate().toLocaleDateString() || 'Unknown Date';
                                            const sessionSubject = s.subject || 'Session';
                                            return (
                                                <SelectItem key={s.id} value={s.id}>
                                                    {`${sessionSubject} on ${sessionDate}`}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Rating</Label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} onClick={() => setRating(star)} type="button" aria-label={`Rate ${star} star`}>
                                            <Star
                                                className={`w-8 h-8 cursor-pointer transition-colors ${
                                                rating >= star
                                                    ? 'text-primary fill-primary'
                                                    : 'text-muted-foreground/30 hover:text-muted-foreground/50'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="feedback-text">Your Feedback (Optional)</Label>
                                <Textarea 
                                    id="feedback-text" 
                                    placeholder="Tell us about your experience..." 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleSubmit} disabled={isSubmitting || !selectedSessionId || rating === 0}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Feedback
                            </Button>
                        </>
                    ) : (
                         <div className="text-center text-muted-foreground p-8">
                            You have no completed sessions to provide feedback for.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
