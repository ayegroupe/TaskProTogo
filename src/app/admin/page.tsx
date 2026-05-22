import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, Users, Briefcase, DollarSign, CheckCircle2, Wallet, Phone } from 'lucide-react';
import { AdminActions } from '@/components/admin/AdminActions';
import { WithdrawalActions } from '@/components/admin/WithdrawalActions';
import { LogoutButton } from '@/components/auth/LogoutButton';

export const dynamic = 'force-dynamic';

// On utilise supabaseAdmin pour tout fetch sans contraintes RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect('/');
  }

  // --- METRIQUES ---
  const { count: usersCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
  const { count: tasksCount } = await supabaseAdmin.from('tasks').select('*', { count: 'exact', head: true });
  
  const { data: bookings } = await supabaseAdmin.from('bookings').select('agreed_amount, platform_fee, service_fee').eq('status', 'paid');
  const totalVolume = bookings?.reduce((sum, b) => sum + (b.agreed_amount || 0), 0) || 0;
  
  // Commission exacte (frais plateforme 12% + frais client 500 F)
  const platformRevenue = bookings?.reduce((sum, b) => sum + (b.platform_fee || 0) + (b.service_fee || 0), 0) || 0;

  // --- ARTISANS EN ATTENTE ---
  const { data: pendingTaskers } = await supabaseAdmin
    .from('tasker_profiles')
    .select('*, profiles(full_name, phone_number, avatar_url)')
    .eq('verification_status', 'in_review');

  // --- RETRAITS EN ATTENTE ---
  const { data: pendingWithdrawals } = await supabaseAdmin
    .from('withdrawals')
    .select('*, tasker:profiles!tasker_id(full_name, phone)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Centre de Contrôle</h1>
              <p className="text-gray-500">Administration ayeJOB</p>
            </div>
          </div>
          <div className="bg-white px-2 py-1 rounded-full shadow-sm border border-gray-200">
            <LogoutButton />
          </div>
        </div>

        {/* STATS GENERALES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Utilisateurs totaux</p>
            <p className="text-3xl font-black text-gray-900">{usersCount || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Demandes créées</p>
            <p className="text-3xl font-black text-gray-900">{tasksCount || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Volume généré</p>
            <p className="text-3xl font-black text-gray-900">{totalVolume} <span className="text-sm font-medium">FCFA</span></p>
          </div>
          <div className="bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-800 text-white">
            <div className="w-10 h-10 bg-gray-800 text-amber-400 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-400 font-medium">Revenus Plateforme (12% + Frais)</p>
            <p className="text-3xl font-black text-white">{platformRevenue} <span className="text-sm font-medium">FCFA</span></p>
          </div>
        </div>

        {/* VALIDATION ARTISANS */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Artisans en attente de validation</h2>
              <p className="text-sm text-gray-500">Vérifiez les profils avant de leur donner accès aux missions.</p>
            </div>
            <span className="bg-amber-100 text-amber-800 font-bold px-4 py-1.5 rounded-full text-sm">
              {pendingTaskers?.length || 0} à traiter
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {(!pendingTaskers || pendingTaskers.length === 0) ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-200 mb-4" />
                <p className="font-medium text-lg">Aucun profil en attente</p>
                <p className="text-sm">Tout est à jour !</p>
              </div>
            ) : (
              pendingTaskers.map((tasker) => (
                <div key={tasker.user_id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0">
                      {tasker.profiles?.avatar_url ? (
                        <img src={tasker.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                          {tasker.profiles?.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        {tasker.profiles?.full_name || 'Utilisateur inconnu'}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">{tasker.profiles?.phone_number || 'Pas de numéro'}</p>
                      
                      <div className="bg-white border border-gray-200 p-3 rounded-lg text-sm text-gray-700">
                        <p><strong>Bio :</strong> {tasker.bio || 'Non renseigné'}</p>
                        <p className="mt-1"><strong>Expérience :</strong> {tasker.experience_years} ans</p>
                        <p className="mt-1"><strong>Taux horaire :</strong> {tasker.hourly_rate} FCFA</p>
                      </div>
                    </div>
                  </div>
                  
                  <AdminActions taskerId={tasker.user_id} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* GESTION DES RETRAITS */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Demandes de retrait (TMoney / Flooz)</h2>
              <p className="text-sm text-gray-500">Vérifiez les numéros et envoyez manuellement l'argent avant de valider.</p>
            </div>
            <span className="bg-blue-100 text-blue-800 font-bold px-4 py-1.5 rounded-full text-sm">
              {pendingWithdrawals?.length || 0} à payer
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {(!pendingWithdrawals || pendingWithdrawals.length === 0) ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-blue-200 mb-4" />
                <p className="font-medium text-lg">Aucun retrait en attente</p>
                <p className="text-sm">Tous les artisans ont été payés !</p>
              </div>
            ) : (
              pendingWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                        {withdrawal.amount} FCFA
                      </h3>
                      <p className="text-gray-500 font-medium">{withdrawal.tasker?.full_name}</p>
                      
                      <div className="mt-3 bg-white border border-gray-200 p-3 rounded-xl flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Numéro de transfert ({withdrawal.payment_method})</p>
                          <p className="font-bold text-lg text-gray-900 tracking-wide">{withdrawal.payment_details?.phone || 'Non spécifié'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <WithdrawalActions withdrawalId={withdrawal.id} taskerId={withdrawal.tasker_id} />
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/dashboard" className="text-emerald-600 font-bold hover:underline">
            Retour au portail
          </Link>
        </div>
      </div>
    </div>
  );
}
