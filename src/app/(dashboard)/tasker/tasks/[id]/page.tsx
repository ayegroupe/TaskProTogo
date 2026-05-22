import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TaskBidForm } from '@/components/tasks/TaskBidForm';
import { ArrowLeft, MapPin, Calendar, Clock, Wallet, UserCircle, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TaskerTaskDetailsPage({ params }: { params: { id: string } }) {
  // Await params correctly for Next.js 15
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the task details (sans le join sur profiles pour éviter l'erreur d'ambiguïté des clés étrangères)
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*, service_categories(name)')
    .eq('id', id)
    .single();

  if (taskError || !task) {
    console.error("Task fetch error:", taskError);
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Mission introuvable</h1>
        <p className="text-gray-500 mb-4">{taskError?.message || "La tâche n'existe pas."}</p>
        <Link href="/tasker" className="text-emerald-600 hover:underline">Retour au tableau de bord</Link>
      </div>
    );
  }

  // Fetch the client's profile separately
  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', task.client_id)
    .single();

  // Check if tasker already placed a bid
  const { data: existingBid } = await supabase
    .from('task_bids')
    .select('*')
    .eq('task_id', id)
    .eq('tasker_id', user.id)
    .single();

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/tasker" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition font-medium">
          <ArrowLeft className="w-4 h-4" /> Retour aux missions
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Task Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                  {task.service_categories?.name || 'Service'}
                </span>
                <span className="text-gray-500 text-sm">Publié le {new Date(task.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              
              <h1 className="text-3xl font-black text-gray-900 mb-4">{task.title}</h1>
              
              <div className="flex items-center gap-2 text-gray-600 mb-8 bg-gray-50 p-4 rounded-xl">
                <UserCircle className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{clientProfile?.full_name || 'Client Anonyme'}</span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-3">Description de la mission</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-8">
                {task.description}
              </p>

              <h3 className="text-lg font-bold text-gray-900 mb-4">Détails de l'intervention</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Lieu</p>
                    <p className="text-gray-900 font-medium">{task.location_neighborhood}</p>
                    <p className="text-sm text-gray-600">{task.location_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Quand ?</p>
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
          </div>

          {/* Sidebar / Bidding Area */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-6 h-6 text-gray-400" />
                <h3 className="text-gray-500 font-medium">Budget du client</h3>
              </div>
              <p className="text-3xl font-black text-gray-900 mb-1">
                {task.budget_amount ? `${task.budget_amount} FCFA` : 'Négociable'}
              </p>
              <p className="text-sm text-gray-500">
                {task.budget_type === 'hourly' ? '/ heure (estimation)' : 'Montant total estimé'}
              </p>
            </div>

            {task.status !== 'open' ? (
              <div className="bg-gray-100 rounded-2xl p-6 text-center text-gray-500 border border-gray-200">
                Cette mission n'accepte plus d'offres.
              </div>
            ) : existingBid ? (
              <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
                <div className="flex items-center justify-center gap-2 text-blue-800 font-bold mb-4">
                  <CheckCircle2 className="w-6 h-6" /> Offre déjà envoyée
                </div>
                <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Votre proposition de prix :</p>
                  <p className="text-3xl font-black text-blue-600 mb-2">{existingBid.amount} FCFA</p>
                  <p className="text-xs text-gray-500">En attente de la réponse du client.</p>
                </div>
              </div>
            ) : (
              <TaskBidForm taskId={task.id} taskerId={user.id} minBudget={task.budget_amount} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
