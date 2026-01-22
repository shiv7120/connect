import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { pricingPlans } from '@/lib/data';

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Pricing Plans</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your child's educational journey. 
          We offer flexible options to suit every need and budget.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {pricingPlans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col shadow-lg ${plan.isPopular ? 'border-primary ring-2 ring-primary' : ''}`}>
            {plan.isPopular && <div className="bg-primary text-primary-foreground text-sm font-bold text-center py-1 rounded-t-lg">MOST POPULAR</div>}
            <CardHeader className="items-center text-center">
              <CardTitle className="font-headline text-3xl">{plan.title}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-center mb-6">
                <span className="text-5xl font-bold">₹{plan.price.toLocaleString()}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full font-bold text-lg py-6" variant={plan.isPopular ? 'default' : 'secondary'}>
                Choose {plan.title}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">Pay-Per-Session</CardTitle>
            <CardDescription>Perfect for one-time help or trying out our service.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center">
                <p className="text-lg text-muted-foreground">Prices start from</p>
                <p className="text-5xl font-bold my-2">₹500 <span className="text-2xl font-normal text-muted-foreground">/ session</span></p>
                <p className="text-muted-foreground mb-6">Price varies based on mentor's experience and subject.</p>
                <Button asChild>
                    <Link href="/find-a-mentor">Find a Mentor & Book</Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
