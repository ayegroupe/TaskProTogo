export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, ListTodo, MessageSquare, User, MapPin, Calendar, Clock } from 'lucide-react';

export default async function ClientDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Récupérer les tâches du client
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, service_categories(name)')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  // Calculer le nombre de tâches non terminées/annulées
  const activeTasksCount = tasks?.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bonjour, {profile?.full_name || 'Client'} !</h1>
          <p className="text-gray-600 mt-1">Gérez vos demandes de services et vos réservations.</p>
        </div>
        <div className="hidden md:flex gap-3">
          <Link href="/client/profile" className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
            Mon Profil
          </Link>
          <Link href="/client/tasks/new" className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition">
            <PlusCircle className="w-5 h-5" />
            Nouvelle demande
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tâches actives</p>
            <p className="text-2xl font-bold text-gray-900">{activeTasksCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Messages non lus</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Profil</p>
            <Link href="/client/profile" className="text-emerald-600 text-sm font-semibold hover:underline">Voir mon profil</Link>
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Mes demandes récentes</h2>
          {(!tasks || tasks.length === 0) && (
            <Link href="/client/tasks/new" className="md:hidden flex items-center gap-2 text-emerald-600 font-medium">
              <PlusCircle className="w-4 h-4" /> Nouvelle
            </Link>
          )}
        </div>

        {(!tasks || tasks.length === 0) ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ListTodo className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune tâche pour le moment</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Vous n'avez pas encore créé de demande de service. Trouvez un artisan qualifié pour vos travaux dès aujourd'hui.
            </p>
            <Link href="/client/tasks/new" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition">
              <PlusCircle className="w-5 h-5" />
              Créer ma première demande
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <Link href={`/client/tasks/${task.id}`} key={task.id} className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-500 hover:shadow-md transition group">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Gauche: Infos de la tâche */}
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {task.service_categories?.name || 'Service'}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                        task.status === 'open' ? 'bg-blue-50 text-blue-700' :
                        task.status === 'in_progress' ? 'bg-amber-50 text-amber-700' :
                        task.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {task.status === 'open' ? 'En recherche d\'artisan' :
                         task.status === 'in_progress' ? 'En cours' :
                         task.status === 'assigned' ? 'Artisan assigné' :
                         task.status === 'completed' ? 'Terminé' : task.status}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition">{task.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {task.location_neighborhood}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {task.scheduled_date ? new Date(task.scheduled_date).toLocaleDateString('fr-FR') : 'Date flexible'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {task.scheduled_time_slot === 'flexible' ? 'Heure flexible' : task.scheduled_time_slot}
                      </div>
                    </div>
                  </div>

                  {/* Droite: Budget */}
                  <div className="md:text-right bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none flex md:block items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{task.budget_amount ? `${task.budget_amount} FCFA` : 'À négocier'}</p>
                      <p className="text-sm text-gray-500">{task.budget_type === 'hourly' ? '/ heure estimé' : 'Budget global'}</p>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
