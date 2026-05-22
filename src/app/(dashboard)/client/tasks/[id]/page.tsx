import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Clock, UserCircle, Star, BadgeCheck } from 'lucide-react';
import { AcceptBidButton } from '@/components/tasks/AcceptBidButton';

export const dynamic = 'force-dynamic';

export default async function ClientTaskDetailsPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Récupérer la tâche
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*, service_categories(name)')
    .eq('id', id)
    .single();

  if (taskError || !task || task.client_id !== user.id) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Mission introuvable</h1>
        <Link href="/client" className="text-emerald-600 hover:underline">Retour au tableau de bord</Link>
      </div>
    );
  }

  // 2. Récupérer les offres (bids) pour cette tâche
  const { data: bids } = await supabase
    .from('task_bids')
    .select('*, profiles(full_name)')
    .eq('task_id', id)
    .order('amount', { ascending: true });

  // 3. Récupérer l'artisan assigné (si la tâche n'est plus "open")
  let assignedTaskerProfile = null;
  if (task.assigned_tasker_id) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', task.assigned_tasker_id)
      .single();
    assignedTaskerProfile = data;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/client" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition font-medium">
          <ArrowLeft className="w-4 h-4" /> Retour aux demandes
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Task Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                  {task.service_categories?.name || 'Service'}
                </span>
                <span className={`text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide ${
                        task.status === 'open' ? 'bg-blue-50 text-blue-700' :
                        task.status === 'assigned' ? 'bg-purple-50 text-purple-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                  {task.status === 'open' ? 'Recherche en cours' : 
                   task.status === 'assigned' ? 'Artisan assigné' : task.status}
                </span>
              </div>
              
              <h1 className="text-3xl font-black text-gray-900 mb-6">{task.title}</h1>
              
              <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-8">
                {task.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Lieu de l'intervention</p>
                    <p className="text-gray-900 font-medium">{task.location_neighborhood}</p>
                    <p className="text-sm text-gray-600">{task.location_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Date souhaitée</p>
                    <p className="text-gray-900 font-medium">
                      {task.scheduled_date ? new Date(task.scheduled_date).toLocaleDateString('fr-FR') : 'Date flexible'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {task.scheduled_time_slot === 'flexible' ? 'Heure flexible' : task.scheduled_time_slot}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Zone d'artisan assigné (Si statut != open) */}
            {task.status !== 'open' && task.status !== 'cancelled' && assignedTaskerProfile && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl p-8 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BadgeCheck className="w-8 h-8 text-emerald-200" />
                  <h2 className="text-2xl font-bold">Mission assignée</h2>
                </div>
                <p className="text-emerald-50 mb-6">Vous avez choisi <strong>{assignedTaskerProfile.full_name}</strong> pour réaliser ce travail. L'artisan va vous contacter très prochainement.</p>
                <div className="bg-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <span>Prochaine étape : Gérez la mission dans l'espace de travail sécurisé.</span>
                  <Link 
                    href={`/client/tasks/${task.id}/workspace`}
                    className="bg-white text-emerald-700 px-6 py-2 rounded-xl font-bold hover:bg-emerald-50 transition shadow-sm whitespace-nowrap"
                  >
                    Accéder à l'espace de travail
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Bids Area */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center justify-between">
              Offres reçues
              <span className="bg-emerald-100 text-emerald-800 text-sm py-1 px-3 rounded-full">{bids?.length || 0}</span>
            </h2>

            {(!bids || bids.length === 0) ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                Aucun artisan n'a encore répondu à votre demande. Revenez un peu plus tard !
              </div>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => (
                  <div key={bid.id} className={`bg-white rounded-3xl shadow-sm border p-6 transition ${bid.status === 'accepted' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-10 h-10 text-gray-400" />
                        <div>
                          <p className="font-bold text-gray-900">{bid.profiles?.full_name || 'Artisan'}</p>
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                            <Star className="w-3 h-3 fill-amber-500" /> 4.9 (nouveau)
                          </div>
                        </div>
                      </div>
                      <p className="text-xl font-black text-gray-900">{bid.amount} <span className="text-sm font-medium text-gray-500">FCFA</span></p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-600 italic">
                      "{bid.message}"
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium mb-6">
                      <span>Durée estimée : {bid.estimated_duration || 'Non précisé'}</span>
                    </div>

                    {task.status === 'open' ? (
                      <AcceptBidButton 
                        bidId={bid.id} 
                        taskId={task.id} 
                        taskerId={bid.tasker_id} 
                        clientId={task.client_id}
                        amount={bid.amount}
                      />
                    ) : bid.status === 'accepted' ? (
                      <div className="bg-emerald-50 text-emerald-700 text-center py-2.5 rounded-xl font-bold flex items-center justify-center gap-2">
                        <BadgeCheck className="w-5 h-5" /> Offre acceptée
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
