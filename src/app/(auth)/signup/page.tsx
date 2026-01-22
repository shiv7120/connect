'use client';
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user && firestore) {
      // User is logged in, check role and redirect
      const accountDocRef = doc(firestore, 'account', user.uid);
      getDoc(accountDocRef).then(accountDoc => {
          if (accountDoc.exists() && accountDoc.data().userType === 'mentor') {
              router.replace('/mentors/dashboard');
          } else {
              router.replace('/students/dashboard');
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

      let finalUserType = userType; // Use the state value from the radio buttons

      if (!accountDocSnap.exists()) {
        const [firstName, ...lastName] = user.displayName?.split(' ') || ['', ''];
        // This is a new user, create their documents
        await setDoc(accountDocRef, {
          id: user.uid,
          email: user.email,
          userType: finalUserType,
        });

        const profileDocRef = doc(firestore, 'profiles', user.uid);
        await setDoc(profileDocRef, {
          firstName: firstName || '',
          lastName: lastName.join(' ') || '',
          email: user.email,
        });

        if (finalUserType === 'mentor') {
          const mentorDocRef = doc(firestore, 'mentors', user.uid);
          await setDoc(mentorDocRef, {
            id: user.uid,
            userId: user.uid,
            name: user.displayName || '',
            qualifications: "",
            teachingSubjects: [],
            hourlyRate: 0,
            availability: ""
          });
        } else { // student
          const studentDocRef = doc(firestore, 'students', user.uid);
          await setDoc(studentDocRef, {
            id: user.uid,
            userId: user.uid,
            name: user.displayName || '',
            grade: ""
          });
        }
        toast({ title: 'Account created successfully!' });
      } else {
        finalUserType = accountDocSnap.data()?.userType || 'student'; // Use existing user's role for redirection
        toast({ title: 'Logged in successfully!' });
      }
      
      // Redirect based on role
      if (finalUserType === 'mentor') {
        router.replace('/mentors/dashboard');
      } else {
        router.replace('/students/dashboard');
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message || "Could not sign up with Google.",
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: fullName });
      
      const [firstName, ...lastName] = fullName.split(' ');
      const accountDocRef = doc(firestore, 'account', user.uid);
      await setDoc(accountDocRef, {
        id: user.uid,
        email: user.email,
        userType: userType,
      });

      const profileDocRef = doc(firestore, 'profiles', user.uid);
      await setDoc(profileDocRef, {
          firstName: firstName || '',
          lastName: lastName.join(' ') || '',
          email: user.email,
      });
      
      if (userType === 'mentor') {
        const mentorDocRef = doc(firestore, 'mentors', user.uid);
        await setDoc(mentorDocRef, {
          id: user.uid,
          userId: user.uid,
          name: fullName,
          qualifications: "",
          teachingSubjects: [],
          hourlyRate: 0,
          availability: ""
        });
      } else { // student
        const studentDocRef = doc(firestore, 'students', user.uid);
        await setDoc(studentDocRef, {
          id: user.uid,
          userId: user.uid,
          name: fullName,
          grade: ""
        });
      }

      toast({ title: 'Account created successfully!' });

      if (userType === 'mentor') {
        router.replace('/mentors/dashboard');
      } else {
        router.replace('/students/dashboard');
      }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Signup Failed',
            description: error.message,
        });
    } finally {
        setIsSubmitting(false);
    }
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
        <h1 className="text-3xl font-bold font-headline">Create an account</h1>
        <p className="text-balance text-muted-foreground">
          Enter your information to create an account
        </p>
      </div>
      <form onSubmit={handleSignup} className="grid gap-4">
        <div className="grid gap-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input id="full-name" placeholder="Anjali Sharma" required value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        
        <div className="grid gap-2">
          <Label>I am a...</Label>
          <RadioGroup defaultValue="student" onValueChange={(value) => setUserType(value)} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="student" id="student" />
              <Label htmlFor="student">Student</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mentor" id="mentor" />
              <Label htmlFor="mentor">Mentor</Label>
            </div>
          </RadioGroup>
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting || isGoogleSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create an account
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
        Sign up with Google
      </Button>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </div>
    </>
  )
}

    