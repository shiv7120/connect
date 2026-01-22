import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
      <h1 className="text-9xl font-bold text-black">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-muted-foreground">
        Page Not Found
      </h2>
      <p className="mt-2 text-muted-foreground">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
