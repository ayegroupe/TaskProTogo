import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserCircle, Briefcase } from 'lucide-react';
import { TaskerWorkspaceActions } from '@/components/workspace/TaskerWorkspaceActions';

export const dynamic = 'force-dynamic';

export default async function TaskerWorkspacePage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: task } = await supabase
    .from('tasks')
    .select('*, service_categories(name)')
    .eq('id', id)
    .single();

  if (!task || task.assigned_tasker_id !== user.id) redirect('/tasker');

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*, client:profiles!client_id(full_name)')
    .eq('task_id', id)
    .single();

  if (!booking) {
    console.error("Booking fetch error:", bookingError);
    return <div className="p-12 text-center text-red-500">Aucune réservation trouvée pour cette tâche. ({bookingError?.message || 'Inconnue'})</div>;
  }

  const clientName = booking.client?.full_name || 'Client';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/tasker" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition">
          <ArrowLeft className="w-4 h-4" /> Retour à mes missions
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Espace de travail Artisan</h1>
              <p className="text-gray-500">{task.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Client</p>
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <UserCircle className="w-5 h-5 text-blue-600" /> {clientName}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Montant net à recevoir</p>
              <p className="font-bold text-gray-900">{booking.tasker_payout || booking.agreed_amount} FCFA <span className="text-xs font-normal text-gray-500">(après commission 12%)</span></p>
            </div>
          </div>

          <TaskerWorkspaceActions booking={booking} taskId={task.id} />
        </div>
      </div>
    </div>
  );
}
