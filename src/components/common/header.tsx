"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/icons/logo';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';

const defaultNavLinks = [
  { href: '/find-a-mentor', label: 'Find a Mentor' },
  { href: '/join-as-a-mentor', label: 'For Mentors' },
  { href: '/pricing', label: 'Pricing' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const [userRole, setUserRole] = useState<'student' | 'mentor' | null>(null);

  useEffect(() => {
    if (user && firestore) {
      const accountDocRef = doc(firestore, 'account', user.uid);
      getDoc(accountDocRef).then(accountDoc => {
        if (accountDoc.exists()) {
          setUserRole(accountDoc.data().userType);
        } else {
          setUserRole(null);
        }
      });
    } else {
      setUserRole(null);
    }
  }, [user, firestore]);

  const navLinks = React.useMemo(() => {
    // While the initial user object is loading, it's safest to show the public links.
    if (isUserLoading) {
      return defaultNavLinks;
    }

    // Once loading is complete, if there's no user, they are logged out.
    if (!user) {
      return defaultNavLinks;
    }

    // At this point, we have a user object.
    if (userRole === 'mentor') {
      // For mentors, only show "For Mentors"
      return defaultNavLinks.filter((link) => link.href === '/join-as-a-mentor');
    }

    // If the user is logged in, but their role is not 'mentor' (could be 'student' or still loading),
    // we can show the links appropriate for a non-mentor.
    // This will show "Find a Mentor" and "Pricing".
    return defaultNavLinks.filter((link) => link.href !== '/join-as-a-mentor');

  }, [user, userRole, isUserLoading]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleDashboardRedirect = () => {
    // The dashboard layout will handle role-specific routing.
    router.push('/students/dashboard');
  }

  const handleLogout = () => {
      if (!auth) return;
      signOut(auth).then(() => {
          closeMobileMenu();
          router.push('/');
      });
  }

  const AuthButtons = () => {
      if (isUserLoading) {
          return <div className="w-24 h-10 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
      }
      if (user) {
          return (
              <Button onClick={handleDashboardRedirect}>Dashboard</Button>
          )
      }
      return (
          <>
            <Button asChild variant="ghost">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </>
      )
  }

  const MobileAuthButtons = () => {
      if(isUserLoading) {
          return <div className="w-full h-20 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
      }
      if (user) {
          return (
            <>
              <Button onClick={() => { closeMobileMenu(); handleDashboardRedirect();}} className="w-full">Dashboard</Button>
              <Button onClick={handleLogout} variant="secondary" className="w-full">Logout</Button>
            </>
          )
      }
      return (
          <>
             <Button asChild onClick={closeMobileMenu}>
                  <Link href="/login">Log In</Link>
              </Button>
              <Button asChild variant="secondary" onClick={closeMobileMenu}>
                  <Link href="/signup">Sign Up</Link>
              </Button>
          </>
      )
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <div className="md:hidden flex-1">
             <Link href="/" className="flex items-center">
                <Logo />
            </Link>
          </div>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="mb-8 flex items-center" onClick={closeMobileMenu}>
              <Logo />
            </Link>
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    'text-lg font-medium transition-colors hover:text-primary',
                    pathname === link.href ? 'text-primary' : 'text-foreground/80'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-col space-y-3">
               <MobileAuthButtons />
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden md:flex items-center space-x-2">
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
}




<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-RS7ZC0SE8R"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-RS7ZC0SE8R');
</script>
