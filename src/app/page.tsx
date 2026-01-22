import Image from 'next/image';
import Link from 'next/link';
import {
  HeartHandshake,
  Banknote,
  ShieldCheck,
  Star,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { testimonials, pricingPlans } from '@/lib/data';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative w-full py-20 md:py-32 lg:py-40 bg-card">
        <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter">
              Personal Mentors for Your Child’s Success
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Find trusted, affordable, and personalized mentorship to help your child excel academically and personally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="font-bold">
                <Link href="/find-a-mentor">Find a Mentor</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="font-bold">
                <Link href="/join-as-a-mentor">Join as a Mentor</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-auto md:w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
          </div>
        </div>
      </section>

      <section id="benefits" className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Why Choose Connect Mentor?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide a supportive ecosystem for growth, learning, and success.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <HeartHandshake className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl">Personalized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">One-on-one sessions tailored to your child's unique learning style and pace.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Banknote className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl">Affordable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Flexible pricing plans and pay-per-session options to fit your family's budget.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl">Trusted</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">All our mentors are thoroughly vetted, qualified, and passionate about teaching.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <section id="testimonials" className="w-full py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Loved by Parents</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear what parents are saying about their Connect Mentor experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => {
              const image = PlaceHolderImages.find(img => img.id === testimonial.imageId);
              return (
                <Card key={testimonial.id} className="flex flex-col justify-between shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-primary fill-primary' : 'text-muted-foreground/50'}`} />
                      ))}
                    </div>
                    <blockquote className="text-foreground italic">"{testimonial.quote}"</blockquote>
                  </CardContent>
                  <CardFooter className="flex items-center gap-4">
                    {image && (
                      <Avatar>
                        <AvatarImage src={image.imageUrl} alt={testimonial.name} data-ai-hint={image.imageHint} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Flexible Pricing for Every Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose a plan that works best for your child's learning journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.slice(0, 3).map((plan) => (
              <Card key={plan.id} className={`flex flex-col shadow-lg ${plan.isPopular ? 'border-primary ring-2 ring-primary' : ''}`}>
                {plan.isPopular && <div className="bg-primary text-primary-foreground text-sm font-bold text-center py-1 rounded-t-md">MOST POPULAR</div>}
                <CardHeader className="items-center text-center">
                  <CardTitle className="font-headline text-2xl">{plan.title}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">₹{plan.price.toLocaleString()}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full font-bold" variant={plan.isPopular ? 'default' : 'secondary'}>
                    Choose Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="link" className="text-primary font-bold">
              <Link href="/pricing">See All Plans & Pay-Per-Session Details</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
