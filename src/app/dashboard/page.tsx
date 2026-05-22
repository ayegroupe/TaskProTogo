import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase } from 'lucide-react';

export default async function DashboardChoice() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  // Redirection automatique si le rôle est déjà défini
  if (profile?.role === 'client') {
    redirect('/client');
  } else if (profile?.role === 'tasker') {
    redirect('/tasker');
  } else if (profile?.role === 'admin') {
    redirect('/admin');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Bienvenue, {profile?.full_name || 'Utilisateur'} !
        </h1>
        <p className="text-xl text-gray-600">
          Comment souhaitez-vous utiliser ayeJOB aujourd'hui ?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Option Client */}
          <form action={async () => {
            'use server';
            const supabaseAdmin = await createClient();
            await supabaseAdmin.from('profiles').update({ role: 'client' }).eq('id', user.id);
            redirect('/client');
          }}>
            <button className="w-full h-full group relative bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 overflow-hidden text-center flex flex-col items-center cursor-pointer">
              <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Espace Client</h2>
              <p className="text-gray-500">
                Je veux trouver des artisans qualifiés et poster des demandes de services.
              </p>
            </button>
          </form>

          {/* Option Artisan */}
          <form action={async () => {
            'use server';
            const supabaseAdmin = await createClient();
            await supabaseAdmin.from('profiles').update({ role: 'tasker' }).eq('id', user.id);
            redirect('/tasker');
          }}>
            <button className="w-full h-full group relative bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden text-center flex flex-col items-center cursor-pointer">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Espace Artisan</h2>
              <p className="text-gray-500">
                Je veux trouver des missions, travailler et gérer mes revenus.
              </p>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
