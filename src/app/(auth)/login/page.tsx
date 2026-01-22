'use client';
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth, useUser, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2">
    <title>Google</title>
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 2.04-4.8 2.04-5.84 0-9.4-4.84-9.4-10.9s3.56-10.9 9.4-10.9c2.6 0 4.3.88 5.7 2.24l2.4-2.4C18.47 1.45 15.47 0 12.48 0 5.8 0 0 5.8 0 12.48s5.8 12.48 12.48 12.48c6.96 0 12-4.84 12-11.64 0-.76-.08-1.48-.2-2.16l-9.8 .04z"
      fill="currentColor"
    />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user && firestore) {
      // User is already logged in, check role and redirect
      const adminDocRef = doc(firestore, 'admins', user.uid);
      const accountDocRef = doc(firestore, 'account', user.uid);

      getDoc(adminDocRef).then(adminDoc => {
        if (adminDoc.exists()) {
          router.replace('/admin/users');
        } else {
          getDoc(accountDocRef).then(accountDoc => {
            if (accountDoc.exists() && accountDoc.data().userType === 'mentor') {
              router.replace('/mentors/dashboard');
            } else {
              router.replace('/students/dashboard');
            }
          });
        }
      });
    }
  }, [user, isUserLoading, router, firestore]);

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    setIsGoogleSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const accountDocRef = doc(firestore, 'account', user.uid);
      const accountDocSnap = await getDoc(accountDocRef);

      if (!accountDocSnap.exists()) {
        const [firstName, ...lastName] = user.displayName?.split(' ') || ['', ''];
        // This is a new user, create their documents
        await setDoc(accountDocRef, {
          id: user.uid,
          email: user.email,
          userType: 'student', // Defaulting new Google Sign-Ins to student
        });

        const profileDocRef = doc(firestore, 'profiles', user.uid);
        await setDoc(profileDocRef, {
            firstName: firstName || '',
            lastName: lastName.join(' ') || '',
            email: user.email,
        });

        const studentDocRef = doc(firestore, 'students', user.uid);
        await setDoc(studentDocRef, {
          id: user.uid,
          userId: user.uid,
          name: user.displayName,
          grade: "",
        });
      }
      
      toast({ title: 'Logged in successfully!' });

      // Re-check admin status after potential creation
      const adminDocRef = doc(firestore, 'admins', user.uid);
      const [adminDoc, finalAccountDoc] = await Promise.all([getDoc(adminDocRef), getDoc(accountDocRef)]);

      if (adminDoc.exists()) {
        router.replace('/admin/users');
      } else if (finalAccountDoc.exists() && finalAccountDoc.data()?.userType === 'mentor') {
        router.replace('/mentors/dashboard');
      } else {
        router.replace('/students/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || "Could not sign in with Google.",
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsSubmitting(true);
    
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const loggedInUser = userCredential.user;
        const adminDocRef = doc(firestore, 'admins', loggedInUser.uid);
        const accountDocRef = doc(firestore, 'account', loggedInUser.uid);
        return Promise.all([getDoc(adminDocRef), getDoc(accountDocRef), loggedInUser]);
      })
      .then(([adminDoc, accountDoc]) => {
        toast({ title: 'Logged in successfully!' });
        if (adminDoc.exists()) {
          router.replace('/admin/users');
        } else if (accountDoc.exists() && accountDoc.data()?.userType === 'mentor') {
          router.replace('/mentors/dashboard');
        } else {
          router.replace('/students/dashboard');
        }
      })
      .catch((error) => {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: "Invalid email or password.",
        });
      })
      .finally(()=> {
        setIsSubmitting(false);
      });
  };

  if (isUserLoading || user) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold font-headline">Login</h1>
        <p className="text-balance text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <form onSubmit={handleLogin} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting || isGoogleSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>
      </form>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn} disabled={isSubmitting || isGoogleSubmitting}>
        {isGoogleSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Login with Google
      </Button>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </div>
    </>
  )
}
