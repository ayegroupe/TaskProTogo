import Link from 'next/link';
import Image from 'next/image';
import { Menu, User, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { MobileMenu } from './MobileMenu';
import { NotificationBell } from './NotificationBell';
import { LogoutButton } from '../auth/LogoutButton';

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = data?.role;
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-transparent.png" alt="ayeJOB Logo" width={140} height={45} className="object-contain" priority />
        </Link>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700">
          <Link href="/taskers" className="hover:text-emerald-600 transition">Trouver un artisan</Link>
          <Link href="/services" className="hover:text-emerald-600 transition">Services</Link>
          <Link href="/devenir-tasker" className="hover:text-emerald-600 transition">Devenir Artisan</Link>
        </div>
        <div className="flex items-center gap-4">
          <MobileMenu user={user} />
          
          {user ? (
            <>
              <NotificationBell userId={user.id} />
              <Link href={userRole === 'client' ? '/client' : userRole === 'tasker' ? '/tasker' : '/admin'} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition font-bold text-sm">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Mon Espace</span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-emerald-600 hover:text-emerald-600 transition">
                <User className="w-4 h-4" />
                <span>Connexion</span>
              </Link>
              <Link href="/register" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm hover:shadow-md">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
