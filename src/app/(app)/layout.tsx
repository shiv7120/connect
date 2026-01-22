"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  BarChart3,
  History,
  MessageSquare,
  DollarSign,
  Calendar,
  ClipboardList,
  UserCheck,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const firestore = useFirestore();
  const auth = useAuth();
  const [userRole, setUserRole] = useState<'student' | 'mentor' | 'admin' | null>(null);

  const handleLogout = () => {
    if (!auth) return;
    signOut(auth).then(() => {
      router.replace('/login');
    }).catch(error => {
      console.error("Logout Error: ", error);
      // You could add a toast notification here to inform the user of the error.
    });
  };

  // Fetch user profile to determine role
  const accountDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'account', user.uid);
  }, [user, firestore]);
  const { data: accountProfile, isLoading: isAccountProfileLoading } = useDoc<{userType: 'student' | 'mentor'}>(accountDocRef);

  // Admin role check
  const adminCheckRef = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return doc(firestore, 'admins', user.uid);
  }, [user, firestore]);
  const { data: isAdminDoc, isLoading: isAdminLoading } = useDoc<{isAdmin: boolean}>(adminCheckRef);

  // Determine user role and handle auth/role protection
  useEffect(() => {
    if (isUserLoading || isAccountProfileLoading || isAdminLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    // Check if the user is an admin
    if (isAdminDoc && isAdminDoc.isAdmin) {
      setUserRole('admin');
      if (!pathname.startsWith('/admin')) {
        router.replace('/admin/users');
      }
      return; // Early return for admins
    }

    // Check for regular user profiles (mentor/student)
    if (accountProfile) {
      const role = accountProfile.userType;
      setUserRole(role);
      if (role === 'mentor') {
        if (!pathname.startsWith('/mentors')) {
          router.replace('/mentors/dashboard');
        }
      } else if (role === 'student') {
        if (!pathname.startsWith('/students')) {
          router.replace('/students/dashboard');
        }
      }
    } else {
      // Fallback for users that exist but may not have a profile document yet.
      // Defaulting to 'student' role.
      setUserRole('student');
      if (!pathname.startsWith('/students')) {
        router.replace('/students/dashboard');
      }
    }
  }, [user, isUserLoading, accountProfile, isAccountProfileLoading, isAdminDoc, isAdminLoading, router, pathname]);

  const isLoading = isUserLoading || !userRole || (!user && !isUserLoading);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }
  
  const userImage = PlaceHolderImages.find((img) => img.id === 'testimonial-1');
  const userName = user?.displayName || "User";

  const studentNav = [
    { href: "/students/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/students/progress", label: "Progress Reports", icon: BarChart3 },
    { href: "/students/history", label: "Session History", icon: History },
    { href: "/students/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/students/account", label: "Account", icon: Settings },
  ];

  const mentorNav = [
    { href: "/mentors/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/mentors/earnings", label: "Earnings", icon: DollarSign },
    { href: "/mentors/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/mentors/account", label: "Account", icon: Settings },
  ];

  const adminNav = [
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/requests", label: "Mentor Requests", icon: ClipboardList },
    { href: "/admin/applications", label: "Mentor Applications", icon: UserCheck },
  ];

  const getNavItems = () => {
    if (userRole === 'admin') return adminNav;
    if (userRole === 'student') return studentNav;
    if (userRole === 'mentor') return mentorNav;
    return [];
  };
  const navItems = getNavItems();

  const getUserRole = () => {
    if (userRole === 'admin') return "Admin";
    if (userRole === 'student') return "Student";
    if (userRole === 'mentor') return "Mentor";
    return "";
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo />
            <SidebarTrigger className="ml-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {(navItems).map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    icon={item.icon}
                    tooltip={item.label}
                  >
                    {item.label}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton icon={LogOut} tooltip="Logout" onClick={handleLogout}>Logout</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <SidebarMenuButton size="lg" className="p-2 justify-start gap-2 h-auto" tooltip="Profile">
                {userImage && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || userImage.imageUrl} alt={userName} />
                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col text-left">
                  <span className="font-medium text-sm">{userName}</span>
                  <span className="text-xs text-muted-foreground">{getUserRole()}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
