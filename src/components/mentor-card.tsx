import Image from 'next/image';
import { Star, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Mentor } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type MentorCardProps = {
  mentor: Mentor;
  className?: string;
};

export function MentorCard({ mentor, className }: MentorCardProps) {
  const mentorImage = PlaceHolderImages.find((img) => img.id === mentor.imageId);

  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-lg', className)}>
      <CardHeader className="p-0 relative">
        <div className="aspect-w-4 aspect-h-3">
            {mentorImage && (
                <Image
                src={mentorImage.imageUrl}
                alt={`Photo of ${mentor.name}`}
                width={400}
                height={300}
                className="object-cover w-full h-full"
                data-ai-hint={mentorImage.imageHint}
                />
            )}
        </div>
        {mentor.isVerified && (
          <Badge className="absolute top-3 right-3 gap-1 pl-2 pr-2.5" variant="secondary">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Verified
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 pb-4">
        <CardTitle className="text-xl font-headline mb-1 flex items-center justify-between">
            {mentor.name}
            <div className="flex items-center gap-1 text-sm font-medium">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span>{mentor.rating.toFixed(1)}</span>
                <span className="text-muted-foreground font-normal">({mentor.reviewCount})</span>
            </div>
        </CardTitle>
        <CardDescription className="mb-2">{mentor.experience} of experience</CardDescription>
        <div className="flex flex-wrap gap-2">
          {mentor.subjects.map((subject) => (
            <Badge key={subject} variant="outline">{subject}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
