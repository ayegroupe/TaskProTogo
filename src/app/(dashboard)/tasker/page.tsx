export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Wallet, Star, ShieldCheck, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';

export default async function TaskerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tasker_profiles(*)')
    .eq('id', user.id)
    .single();

  const isVerified = profile?.tasker_profiles?.verification_status === 'verified' || 
                     (Array.isArray(profile?.tasker_profiles) && profile?.tasker_profiles[0]?.verification_status === 'verified');

  const taskerProfileObj = Array.isArray(profile?.tasker_profiles) ? profile?.tasker_profiles[0] : profile?.tasker_profiles;

  // Calculer les statistiques de l'artisan
  const { data: completedBookings } = await supabase
    .from('bookings')
    .select('tasker_payout')
    .eq('tasker_id', user.id)
    .eq('status', 'paid');
    
  const totalEarned = completedBookings?.reduce((sum, b) => sum + (b.tasker_payout || 0), 0) || 0;
  
  // Calculer les retraits pour obtenir le vrai solde disponible
  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('amount, status')
    .eq('tasker_id', user.id);
    
  const totalWithdrawn = withdrawals?.filter(w => ['pending', 'processing', 'completed'].includes(w.status || ''))
                                     .reduce((sum, w) => sum + (w.amount || 0), 0) || 0;
  
  const availableBalance = totalEarned - totalWithdrawn;
  const completedCount = completedBookings?.length || 0;
  const ratingAvg = taskerProfileObj?.rating_avg || 0;

  // Récupérer les missions disponibles (statut 'open')
  const { data: availableTasks } = await supabase
    .from('tasks')
    .select('*, service_categories(name)')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  // Récupérer les missions en cours de l'artisan
  const { data: activeTasks } = await supabase
    .from('tasks')
    .select('*, service_categories(name)')
    .eq('assigned_tasker_id', user.id)
    .in('status', ['assigned', 'in_progress'])
    .order('updated_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Espace Artisan</h1>
          <p className="text-gray-600 mt-1">Bienvenue {profile?.full_name}, trouvez de nouvelles missions.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!isVerified && (
            <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl text-sm font-bold border border-yellow-200">
              Profil en attente
            </span>
          )}
          <Link 
            href="/tasker/profile" 
            className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm whitespace-nowrap"
          >
            Mon Profil
          </Link>
          <Link 
            href="/tasker/earnings" 
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition shadow-sm whitespace-nowrap"
          >
            <Wallet className="w-4 h-4" /> Mes Gains
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Solde disponible</p>
            <p className="text-2xl font-bold text-gray-900">{availableBalance} FCFA</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Missions terminées</p>
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Note moyenne</p>
            <p className="text-2xl font-bold text-gray-900">{ratingAvg > 0 ? ratingAvg : 'N/A'}</p>
          </div>
        </div>
      </div>

      {!isVerified && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">Vérifiez votre profil pour postuler</h3>
                <p className="text-gray-300 max-w-2xl">
                  Pour garantir la sécurité de nos clients, vous devez vérifier votre identité (carte d'identité) et renseigner vos compétences avant de pouvoir accepter des missions.
                </p>
              </div>
            </div>
            <Link href="/tasker/profile" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-500 transition shadow-sm whitespace-nowrap">
              Compléter mon profil <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}

      {/* MISSIONS EN COURS */}
      {activeTasks && activeTasks.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
            <Briefcase className="w-6 h-6" /> Mes missions en cours
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {activeTasks.map((task) => (
              <div key={task.id} className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-white text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-emerald-100">
                      {task.service_categories?.name || 'Service'}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${task.status === 'assigned' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {task.status === 'assigned' ? 'En attente de paiement' : 'En cours de réalisation'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950">{task.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-emerald-700">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {task.location_neighborhood}
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/tasker/tasks/${task.id}/workspace`}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-md whitespace-nowrap text-center"
                >
                  Gérer la mission
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Missions récentes disponibles</h2>
        
        {(!availableTasks || availableTasks.length === 0) ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune mission pour l'instant</h3>
            <p className="text-gray-500">
              Il n'y a pas de demande de service dans votre zone actuellement. Revenez plus tard !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {availableTasks.map((task) => (
              <div key={task.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {task.service_categories?.name || 'Service'}
                    </span>
                    <span className="text-lg font-black text-gray-900">
                      {task.budget_amount ? `${task.budget_amount} FCFA` : 'Négociable'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{task.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{task.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{task.location_neighborhood}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {task.scheduled_date ? new Date(task.scheduled_date).toLocaleDateString('fr-FR') : 'Date flexible'} 
                        {' • '}{task.scheduled_time_slot === 'flexible' ? 'Heure flexible' : task.scheduled_time_slot}
                      </span>
                    </div>
                  </div>
                </div>

                {isVerified ? (
                  <Link 
                    href={`/tasker/tasks/${task.id}`}
                    className="w-full py-3 rounded-xl font-bold text-center transition block bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                  >
                    Faire une offre
                  </Link>
                ) : (
                  <div 
                    className="w-full py-3 rounded-xl font-bold text-center transition block bg-gray-100 text-gray-400 cursor-not-allowed"
                    title="Veuillez d'abord vérifier votre profil"
                  >
                    Faire une offre (Profil non vérifié)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
