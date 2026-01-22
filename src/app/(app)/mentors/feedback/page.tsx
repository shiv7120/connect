'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { testimonials } from "@/lib/data";
import { Star } from "lucide-react";

export default function MentorFeedbackPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold">Parent Feedback</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Parent Feedback</CardTitle>
                    <CardDescription>Here's what parents are saying about your sessions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {testimonials.map(t => (
                        <Card key={t.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{t.name}</p>
                                    <p className="text-sm text-muted-foreground italic">"{t.quote}"</p>
                                </div>
                                <div className="flex items-center gap-1 text-sm shrink-0">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} />
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
