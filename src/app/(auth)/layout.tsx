import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authBgImage = PlaceHolderImages.find((img) => img.id === 'auth-background');

  return (
    <div className="w-full lg:grid lg:min-h-dvh lg:grid-cols-2 xl:min-h-dvh">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Link href="/">
              <Logo className="mx-auto" />
            </Link>
          </div>
          {children}
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {authBgImage && (
          <Image
            src={authBgImage.imageUrl}
            alt={authBgImage.description}
            data-ai-hint={authBgImage.imageHint}
            fill
            className="object-cover"
          />
        )}
      </div>
    </div>
  );
}
