import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { Logo } from '@/components/icons/logo';

export function Footer() {
  return (
    <footer className="w-full border-t bg-secondary">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo />
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering the next generation through personalized mentorship.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/find-a-mentor" className="text-muted-foreground hover:text-primary">Find a Mentor</Link></li>
              <li><Link href="/join-as-a-mentor" className="text-muted-foreground hover:text-primary">Become a Mentor</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Community Hubs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Connect Mentor. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Github className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
